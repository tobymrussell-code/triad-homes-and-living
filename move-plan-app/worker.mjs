import {OWNER,ORIGIN,GUIDE,fields,cleanInput,buyer,validateArea,approvalProblems,cityKey} from './core.mjs';
import {generatePlan} from './engine.mjs';
import {page,formPage,thanksPage,authPage,planPage,adminPage,clientScript,mapScript} from './views.mjs';
const now=()=>Date.now();
export const token=()=>[...crypto.getRandomValues(new Uint8Array(32))].map(n=>n.toString(16).padStart(2,'0')).join('');
export async function hash(value){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(n=>n.toString(16).padStart(2,'0')).join('');}
const json=(data,status=200,headers={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
const redirect=path=>new Response(null,{status:303,headers:{Location:path,'Cache-Control':'no-store'}});
async function getSession(request,env){const value=request.headers.get('Cookie')?.match(/(?:^|;\s*)move_session=([a-f0-9]{64})/)?.[1];if(!value)return null;return env.DB.prepare('SELECT role,subject FROM sessions WHERE hash=? AND expires_at>?').bind(await hash(value),now()).first();}
async function requireAdmin(request,env){const s=await getSession(request,env);if(s?.role!=='admin'||s.subject!==OWNER)throw new HttpError(401,'Please sign in as Toby.');return s;}
class HttpError extends Error{constructor(status,message){super(message);this.status=status;}}
async function input(request){const length=Number(request.headers.get('Content-Length')||0);if(length>40000)throw new HttpError(413,'Request too large.');const text=await request.text();if(text.length>40000)throw new HttpError(413,'Request too large.');try{return request.headers.get('Content-Type')?.includes('application/json')?JSON.parse(text):Object.fromEntries(new URLSearchParams(text));}catch{throw new HttpError(400,'Please check your request.');}}
async function rate(env,key,limit,seconds){const start=Math.floor(now()/(seconds*1000));const k=key+':'+start;const row=await env.DB.prepare('INSERT INTO rate_limits(key,count,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(k,now()+seconds*2000).first();if(row.count>limit)throw new HttpError(429,'Please wait a few minutes before trying again.');}
async function audit(env,id,action){await env.DB.prepare('INSERT INTO audit(lead_id,action,created_at) VALUES(?,?,?)').bind(id,action,now()).run();}
async function enqueue(env,id,type,lead,payload,available=now()){await env.DB.prepare('INSERT OR IGNORE INTO outbox(id,type,lead_id,payload,available_at,updated_at) VALUES(?,?,?,?,?,?)').bind(id,type,lead,JSON.stringify(payload),available,now()).run();}
async function sendToken(env,purpose,subject,leadId=null){
 const raw=token(),digest=await hash(raw),expiry=now()+30*60000;
 const to=purpose==='admin'?OWNER:subject;
 await env.DB.prepare('INSERT INTO auth_tokens(hash,purpose,subject,expires_at) VALUES(?,?,?,?)').bind(digest,purpose,leadId||subject,expiry).run();
 const link=`${ORIGIN}/verify#token=${raw}`;
 const text=purpose==='admin'?`Use this link to sign in to your Move Plan review dashboard. It expires in 30 minutes.\n\n${link}`:`Confirm your email so I can prepare and share your personalized Move Plan. This link expires in 30 minutes.\n\n${link}\n\nYou can read the Lexington local guide now: ${GUIDE}\n\nToby Russell, REALTOR®`;
 await enqueue(env,'verify:'+digest,'email',leadId,{to,subject:purpose==='admin'?'Your Move Plan dashboard sign-in':'Confirm your email for your Move Plan',text});
}
async function submit(request,env,ctx){
 const body=await input(request);
 if(body.website)throw new HttpError(400,'Please try again.');
 let data;try{data=cleanInput(body);}catch(e){throw new HttpError(400,e.message);}const key=String(body.request_key||'');
 if(!/^[\w-]{16,100}$/.test(key))throw new HttpError(400,'Reload the form and try again.');
 const existing=await env.DB.prepare('SELECT id,edit_hash FROM leads WHERE request_key=?').bind(key).first();
 if(existing)return json({ok:true,id:existing.id,duplicate:true});
 const edit=token(),id=token();
 const inserted=await env.DB.prepare('INSERT OR IGNORE INTO leads(id,request_key,email,data,edit_hash,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').bind(id,key,data.email,JSON.stringify(data),await hash(edit),now(),now()).run();
 if(!inserted.meta.changes){const previous=await env.DB.prepare('SELECT id FROM leads WHERE request_key=?').bind(key).first();return json({ok:true,id:previous.id,duplicate:true});}
 await enqueue(env,'hubspot:'+id,'hubspot',id,{data});
 await sendToken(env,'verify',data.email,id);
 await audit(env,id,'submitted');
 ctx.waitUntil(drain(env));
 return json({ok:true,id,edit},201);
}
async function verify(request,env,ctx){
 const b=await input(request);if(!/^[a-f0-9]{64}$/.test(b.token||''))throw new HttpError(400,'This link is invalid.');
 const t=await env.DB.prepare('UPDATE auth_tokens SET used=1 WHERE hash=? AND used=0 AND expires_at>? RETURNING purpose,subject').bind(await hash(b.token),now()).first();
 if(!t)throw new HttpError(400,'This link expired or was already used. Request a fresh link.');
 let role='buyer',subject=t.subject,path='/';
 if(t.purpose==='admin'){role='admin';subject=OWNER;path='/admin';}
 else {
  const lead=await env.DB.prepare('UPDATE leads SET verified=1,updated_at=? WHERE id=? RETURNING id,status').bind(now(),subject).first();
  if(!lead)throw new HttpError(400,'The request was not found.');
  path=['APPROVED','SENT'].includes(lead.status)?'/move-plan/'+lead.id:'/thanks/'+lead.id;
  ctx.waitUntil(processQueue(env));
 }
 const raw=token();await env.DB.prepare('INSERT INTO sessions(hash,role,subject,expires_at) VALUES(?,?,?,?)').bind(await hash(raw),role,subject,now()+7*86400000).run();
 return json({ok:true,path},200,{'Set-Cookie':`move_session=${raw}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`});
}
async function hubspot(data){
 const r=await fetch('https://api.hsforms.com/submissions/v3/integration/submit/44205664/22f95740-eb32-4ff2-b843-a9c3e2f1192c',{
  method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:fields.filter(([name])=>data[name]).map(([name])=>({objectTypeId:'0-1',name,value:data[name]})),context:{pageUri:ORIGIN+'/',pageName:'Personalized Move Plan questionnaire'}}),signal:AbortSignal.timeout(12000)});
 if(!r.ok){const text=await r.text();throw new Error('HubSpot '+r.status+': '+text.slice(0,300));}
 return 'confirmed';
}
export async function drain(env){
 const {results}=await env.DB.prepare("SELECT id FROM outbox WHERE state='pending' AND available_at<=? ORDER BY available_at LIMIT 12").bind(now()).all();
 for(const item of results){
  const job=await env.DB.prepare("UPDATE outbox SET state='sending',attempts=attempts+1,updated_at=? WHERE id=? AND state='pending' RETURNING *").bind(now(),item.id).first();
  if(!job)continue;
  try{
   const payload=JSON.parse(job.payload);let provider;
   if(job.type==='hubspot'){
    provider=await hubspot(payload.data);
    await env.DB.prepare("UPDATE leads SET hubspot_status='confirmed' WHERE id=?").bind(job.lead_id).run();
   }else{
    if(job.type==='plan'){
     const lead=await env.DB.prepare('SELECT status,revision FROM leads WHERE id=?').bind(job.lead_id).first();
     if(!lead||lead.status!=='APPROVED'||lead.revision!==payload.revision){await env.DB.prepare("UPDATE outbox SET state='cancelled',updated_at=? WHERE id=?").bind(now(),job.id).run();continue;}
    }
    const sent=await env.EMAIL.send({from:{email:'toby@plans.triadhomesliving.com',name:'Toby Russell, REALTOR®'},to:payload.to,replyTo:OWNER,subject:payload.subject,text:payload.text});
    if(!sent.messageId)throw new Error('Email provider did not confirm a message ID.');
    provider=sent.messageId;
   }
   await env.DB.prepare("UPDATE outbox SET state='sent',provider_id=?,error=NULL,updated_at=? WHERE id=?").bind(provider,now(),job.id).run();
   if(job.type==='plan')await env.DB.prepare("UPDATE leads SET status='SENT',updated_at=? WHERE id=? AND status='APPROVED'").bind(now(),job.lead_id).run();
  }catch(error){
   const canRetry=job.type==='hubspot'&&job.attempts<4&&!/HubSpot 4(?!29)/.test(error.message);
   await env.DB.prepare('UPDATE outbox SET state=?,error=?,available_at=?,updated_at=? WHERE id=?').bind(canRetry?'pending':'failed',String(error.message).slice(0,400),now()+job.attempts*60000,now(),job.id).run();
   if(job.type==='hubspot')await env.DB.prepare("UPDATE leads SET hubspot_status='needs_attention' WHERE id=?").bind(job.lead_id).run();
  }
 }
}
export async function processQueue(env){
 // A database lease prevents overlapping cron / verification / admin generation jobs.
 const lock=await env.DB.prepare("INSERT INTO rate_limits(key,count,expires_at) VALUES('generation-lock',1,?) ON CONFLICT(key) DO UPDATE SET expires_at=excluded.expires_at WHERE expires_at<? RETURNING key").bind(now()+300000,now()).first();
 if(!lock){await drain(env);return;}
 try{
  const {results}=await env.DB.prepare("SELECT id FROM leads WHERE verified=1 AND (status='NEW' OR (status='GENERATING' AND lease_until<?)) ORDER BY created_at LIMIT 2").bind(now()).all();
  for(const row of results){
   const lead=await env.DB.prepare("UPDATE leads SET status='GENERATING',lease_until=?,updated_at=? WHERE id=? AND (status='NEW' OR lease_until<?) RETURNING *").bind(now()+240000,now(),row.id,now()).first();
   if(!lead)continue;
   try{
    const plan=await generatePlan(env,lead);
    await env.DB.prepare("UPDATE leads SET plan=?,status='DRAFT',error=NULL,lease_until=0,updated_at=? WHERE id=? AND revision=? AND status='GENERATING'").bind(JSON.stringify(plan),now(),lead.id,lead.revision).run();
    await enqueue(env,`draft:${lead.id}:${lead.revision}`,'email',lead.id,{to:OWNER,subject:`Move Plan draft ready · ${JSON.parse(lead.data).firstname}`,text:`A new Move Plan draft is ready for your review.\n\nOpen your dashboard: ${ORIGIN}/admin\n\n${plan.areas.length} supported locations. ${plan.warnings.length} review items.\n\nApprove the plan only after checking the sources, matched workplace and stops, and route estimates. The buyer has not been sent their plan.`});
    await audit(env,lead.id,'draft_generated');
   }catch(error){await env.DB.prepare("UPDATE leads SET status='DRAFT',error=?,lease_until=0,updated_at=? WHERE id=? AND revision=?").bind('Generation failed. Update the answers or area data and retry.',now(),lead.id,lead.revision).run();}
  }
 }finally{await env.DB.prepare("DELETE FROM rate_limits WHERE key='generation-lock'").run();}
 await drain(env);
 await env.DB.batch([
  env.DB.prepare('DELETE FROM auth_tokens WHERE expires_at<?').bind(now()-86400000),
  env.DB.prepare('DELETE FROM sessions WHERE expires_at<?').bind(now()),
  env.DB.prepare("DELETE FROM rate_limits WHERE expires_at<? AND key!='generation-lock'").bind(now()),
  env.DB.prepare('DELETE FROM geo_cache WHERE expires_at<?').bind(now())
 ]);
}
async function adminAPI(request,env,ctx,path){
 await requireAdmin(request,env);
 if(request.method==='GET'){
  if(path==='/api/admin/overview'){
   const [leads,areas,cities,outbox]=await Promise.all([
    env.DB.prepare('SELECT id,email,data,status,revision,note,error,hubspot_status,created_at,updated_at,verified FROM leads ORDER BY updated_at DESC LIMIT 100').all(),
    env.DB.prepare('SELECT data FROM areas ORDER BY id').all(),env.DB.prepare('SELECT data FROM cities ORDER BY id').all(),
    env.DB.prepare("SELECT id,type,lead_id,state,attempts,error,available_at,provider_id FROM outbox WHERE state IN ('failed','sending') OR type='plan' ORDER BY updated_at DESC LIMIT 100").all()]);
   return json({leads:leads.results.map(l=>({...l,data:JSON.parse(l.data)})),areas:areas.results.map(a=>JSON.parse(a.data)),cities:cities.results.map(c=>JSON.parse(c.data)),outbox:outbox.results});
  }
  const id=path.split('/').pop();const lead=await env.DB.prepare('SELECT * FROM leads WHERE id=?').bind(id).first();
  if(!lead)throw new HttpError(404,'Request not found.');
  return json({...lead,data:JSON.parse(lead.data),plan:lead.plan?JSON.parse(lead.plan):null});
 }
 const body=await input(request);
 if(path==='/api/admin/area'){
  let area;try{area=validateArea(body);}catch(e){throw new HttpError(400,e.message);}await env.DB.prepare('INSERT INTO areas(id,data,updated_at) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at').bind(area.id,JSON.stringify(area),now()).run();return json({ok:true});
 }
 if(path==='/api/admin/city'){
  if(!/^[\w-]{1,80}$/.test(body.id||'')||typeof body.name!=='string'||body.name.length>100)throw new HttpError(400,'Check city name and ID.');
  if(!Array.isArray(body.resources)||body.resources.length>30||body.resources.some(r=>typeof r.title!=='string'||r.title.length>120||typeof r.url!=='string'||!/^https:\/\//.test(r.url)))throw new HttpError(400,'Use up to 30 titled HTTPS resource links.');
  for(const k of ['guide','bookingUrl','searchUrl'])if(body[k]&&!/^https:\/\//.test(body[k]))throw new HttpError(400,'Use HTTPS links.');
  await env.DB.prepare('INSERT INTO cities(id,data,updated_at) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at').bind(body.id,JSON.stringify(body),now()).run();return json({ok:true});
 }
 if(path==='/api/admin/retry-delivery'){
  const job=await env.DB.prepare("UPDATE outbox SET state='pending',error=NULL,available_at=?,updated_at=? WHERE id=? AND state='failed' RETURNING id").bind(now(),now(),body.id).first();
  if(!job)throw new HttpError(409,'That delivery is not in a failed state. Check the provider before retrying an uncertain send.');ctx.waitUntil(drain(env));return json({ok:true});
 }
 const lead=await env.DB.prepare('SELECT * FROM leads WHERE id=?').bind(body.id).first();
 if(!lead)throw new HttpError(404,'Request not found.');
 if(body.revision!==lead.revision)throw new HttpError(409,'This draft changed. Reload it before saving.');
 if(path==='/api/admin/save'){
  if(!body.plan||JSON.stringify(body.plan).length>60000||typeof body.note!=='string'||body.note.length>3000)throw new HttpError(400,'Check the plan and personal note.');
  const row=await env.DB.prepare("UPDATE leads SET plan=?,note=?,status='DRAFT',revision=revision+1,updated_at=? WHERE id=? AND revision=? RETURNING revision").bind(JSON.stringify(body.plan),body.note,now(),lead.id,lead.revision).first();
  if(!row)throw new HttpError(409,'This draft changed. Reload it.');await audit(env,lead.id,'draft_edited');return json({ok:true,revision:row.revision});
 }
 if(path==='/api/admin/regenerate'){
  if(!lead.verified)throw new HttpError(409,'The buyer needs to verify their email first.');
  await env.DB.prepare("UPDATE leads SET status='NEW',revision=revision+1,lease_until=0,updated_at=? WHERE id=? AND revision=?").bind(now(),lead.id,lead.revision).run();ctx.waitUntil(processQueue(env));return json({ok:true});
 }
 if(path==='/api/admin/approve'){
  if(lead.status!=='DRAFT'||!lead.verified)throw new HttpError(409,'Only a verified buyer’s draft can be approved.');
  const plan=lead.plan?JSON.parse(lead.plan):null;
  const problems=approvalProblems(plan,buyer(JSON.parse(lead.data)));if(problems.length)throw new HttpError(400,problems.join(' '));
  const deliverAt=Math.max(now(),Number(body.deliverAt)||now());if(deliverAt>now()+7*86400000)throw new HttpError(400,'Choose a delivery within seven days.');
  const b=buyer(JSON.parse(lead.data));
  const payload={revision:lead.revision,to:lead.email,subject:`${b.first}, your personalized Move Plan is ready`,text:`Hi ${b.first},\n\n${lead.note||'I’ve put together your Move Plan using the work trip, regular stops, and home priorities you shared. Take a look, and let me know which options you’d like to explore.'}\n\nYour private plan: ${ORIGIN}/move-plan/${lead.id}\n\nYou may be asked to confirm your email to open it. Reply here with any questions.\n\nToby Russell, REALTOR®\nTriad Homes & Living\n${GUIDE}`};
  const results=await env.DB.batch([
   env.DB.prepare("UPDATE leads SET status='APPROVED',updated_at=? WHERE id=? AND revision=? AND status='DRAFT'").bind(now(),lead.id,lead.revision),
   env.DB.prepare("INSERT OR IGNORE INTO outbox(id,type,lead_id,payload,available_at,updated_at) SELECT ?,'plan',?,?,?,? WHERE EXISTS(SELECT 1 FROM leads WHERE id=? AND revision=? AND status='APPROVED')").bind(`plan:${lead.id}:${lead.revision}`,lead.id,JSON.stringify(payload),deliverAt,now(),lead.id,lead.revision)
  ]);
  if(!results[0].meta.changes)throw new HttpError(409,'Approval already changed. Reload the draft.');
  await audit(env,lead.id,'approved');ctx.waitUntil(drain(env));return json({ok:true,deliverAt});
 }
 throw new HttpError(404,'Unknown action.');
}
async function handle(request,env,ctx){
 const url=new URL(request.url),path=url.pathname;
 if(request.method==='POST'){
  if(request.headers.get('Origin')!==ORIGIN)throw new HttpError(403,'Please submit from the Move Plan website.');
  await rate(env,'ip:'+await hash(request.headers.get('CF-Connecting-IP')||'unknown'),30,600);
 }
 if(path==='/health')return json({ok:true,service:'triad-move-plans'});
 if(path==='/app.js')return new Response(clientScript,{headers:{'Content-Type':'application/javascript','Cache-Control':'public,max-age=60'}});
 if(path==='/map.js')return new Response(mapScript,{headers:{'Content-Type':'application/javascript','Cache-Control':'public,max-age=60'}});
 if(path==='/api/intake'&&request.method==='POST')return submit(request,env,ctx);
 if(path==='/api/verify'&&request.method==='POST')return verify(request,env,ctx);
 if(path==='/api/admin-login'&&request.method==='POST'){
  await rate(env,'admin-mail',3,900);await sendToken(env,'admin',OWNER);ctx.waitUntil(drain(env));return json({ok:true});
 }
 if(path==='/api/resend'&&request.method==='POST'){
  const body=await input(request);await rate(env,'resend:'+String(body.id),3,1800);
  const lead=await env.DB.prepare('SELECT id,email FROM leads WHERE id=?').bind(String(body.id||'')).first();
  if(lead&&lead.email===String(body.email||'').toLowerCase().trim())await sendToken(env,'verify',lead.email,lead.id);
  ctx.waitUntil(drain(env));return json({ok:true});
 }
 if(path.startsWith('/api/admin/'))return adminAPI(request,env,ctx,path);
 if(path==='/api/logout'&&request.method==='POST'){const raw=request.headers.get('Cookie')?.match(/(?:^|;\s*)move_session=([a-f0-9]{64})/)?.[1];if(raw)await env.DB.prepare('DELETE FROM sessions WHERE hash=?').bind(await hash(raw)).run();return json({ok:true},200,{'Set-Cookie':'move_session=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0'});}
 if(path==='/verify')return authPage();
 if(path==='/admin'){
  const s=await getSession(request,env);return s?.role==='admin'&&s.subject===OWNER?adminPage():page('Review your Move Plans','<section class="panel narrow"><p class="eyebrow">TOBY’S DASHBOARD</p><h1>Review your Move Plans</h1><p>Send a secure sign-in link to your Gmail address.</p><button data-admin-login>Email my sign-in link</button><p id="message" role="status"></p></section>');
 }
 if(path.startsWith('/thanks/')){
  const id=path.split('/')[2];const s=await getSession(request,env);
  const verified=s?.subject===id&&s.role==='buyer';return thanksPage(id,verified);
 }
 if(path.startsWith('/move-plan/')){
  const id=path.split('/')[2];const s=await getSession(request,env);
  if(s?.role!=='admin'&&!(s?.role==='buyer'&&s.subject===id))return page('Open your private Move Plan',`<section class="panel narrow"><h1>Open your private Move Plan</h1><p>Enter the email you used for your questionnaire. I’ll send a button to confirm it’s you.</p><form data-resend><input type="hidden" name="id" value="${/^[a-f0-9]{64}$/.test(id)?id:''}"><label>Email<input name="email" type="email" required></label><button>Email my access link</button></form><p id="message" role="status"></p></section>`);
  const lead=await env.DB.prepare('SELECT * FROM leads WHERE id=?').bind(id).first();
  if(!lead||(!['APPROVED','SENT'].includes(lead.status)&&s.role!=='admin'))throw new HttpError(404,'Your plan is still being prepared. Check your email after Toby reviews it.');
  const {results}=await env.DB.prepare('SELECT data FROM cities').all();
  const cities=results.map(r=>JSON.parse(r.data));const city=cities.find(c=>cityKey(c.name)===cityKey(buyer(JSON.parse(lead.data)).city));
  return planPage(lead,city);
 }
 if(path==='/')return formPage(url.searchParams.get('city')||'Lexington, NC');
 if(path==='/robots.txt')return new Response('User-agent: *\nDisallow: /\n');
 throw new HttpError(404,'Page not found.');
}
export default {
 async fetch(request,env,ctx){
  let response;
  try{response=await handle(request,env,ctx);}catch(error){const status=error.status||500;const message=error.status?error.message:'Something went wrong. Please try again, or contact Toby if this continues.';response=request.url.includes('/api/')?json({ok:false,error:message},status):page('Please try again',`<section class="panel narrow"><h1>Please try again</h1><p>${String(message).replace(/[<>&]/g,'')}</p><a class="button" href="/">Return to your questionnaire</a></section>`,status);}
  const headers=new Headers(response.headers);
  headers.set('Referrer-Policy','no-referrer');headers.set('X-Content-Type-Options','nosniff');headers.set('X-Frame-Options','DENY');headers.set('X-Robots-Tag','noindex, nofollow');
  headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https://triadhomesliving.com https://tiles.openfreemap.org https://*.openfreemap.org; connect-src 'self' https://tiles.openfreemap.org https://*.openfreemap.org; frame-src https://www.youtube-nocookie.com; worker-src blob:; font-src 'self' https://tiles.openfreemap.org; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
  return new Response(response.body,{status:response.status,headers});
 },
 async scheduled(event,env,ctx){ctx.waitUntil(processQueue(env));}
};
