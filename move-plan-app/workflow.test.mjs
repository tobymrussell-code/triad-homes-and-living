import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker,{drain} from './worker.mjs';
import {ORIGIN,fields,eligible,rankAndChoose,approvalProblems} from './core.mjs';
class D1 {
 constructor(){this.db=new DatabaseSync(':memory:');this.db.exec(readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));}
 prepare(sql){const db=this.db;let args=[];return {bind(...values){args=values;return this;},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){const x=db.prepare(sql).run(...args);return {meta:{changes:Number(x.changes)}};}};}
 async batch(statements){this.db.exec('BEGIN');try{const results=[];for(const s of statements)results.push(await s.run());this.db.exec('COMMIT');return results;}catch(e){this.db.exec('ROLLBACK');throw e;}}
}
const sample=Object.fromEntries(fields.map(([k,,type])=>[k,Array.isArray(type)?type[0]:type==='number'?'3':'Test']));
Object.assign(sample,{firstname:'Toby',lastname:'Russell',email:'tobymrussell@gmail.com',phone:'',buyer_guide__area_of_interest:'Lexington, NC',buyer_guide__work_address_or_city:'2 N Main St, Lexington, NC',buyer_guide___maximum_home_budget:'450000',buyer_guide__maximum_commute_minutes:'60',buyer_guide___everyday_places:'Food Lion, Lexington NC',buyer_guide__main_priority:'More home for the money',buyer_guide__home_type:'Existing single-family home',buyer_guide__yard_preference:'Open to different lot sizes'});
const seed=[{id:'a',lat:35.82,lon:-80.25,city:'Lexington'},{id:'b',lat:35.87,lon:-80.28,city:'Lexington'},{id:'c',lat:35.88,lon:-80.08,city:'Thomasville'},{id:'d',lat:36.02,lon:-80.21,city:'Winston Salem'}].map(a=>({...a,title:a.id,address:a.id+' NC',price:300000,beds:4,acres:0.5,sqft:2000,homeType:'Existing single-family home',source:'https://www.zillow.com/',checkedAt:new Date().toISOString().slice(0,10),active:true}));
const originalFetch=globalThis.fetch;
test('private access, approval and durable delivery through normal APIs',async()=>{
 const sent=[],pending=[],env={DB:new D1(),AI:{run:async()=>({response:JSON.stringify({welcome:'Here is your plan.',notes:seed.map(a=>({id:a.id,note:'This example fits your home needs and regular trips.'}))})})},EMAIL:{send:async message=>{sent.push(message);return {messageId:'message-'+sent.length};}}};
 const ctx={waitUntil(p){pending.push(p);}};
 async function settle(){while(pending.length)await Promise.all(pending.splice(0));}
 async function req(path,data,cookie){return worker.fetch(new Request(ORIGIN+path,{method:data?'POST':'GET',headers:{...(data?{'Content-Type':'application/json',Origin:ORIGIN}:{}),...(cookie?{Cookie:cookie}:{})},body:data?JSON.stringify(data):undefined}),env,ctx);}
 globalThis.fetch=async url=>{
  if(String(url).includes('api.hsforms.com'))return Response.json({inlineMessage:'Thanks'});
  if(String(url).includes('/table/'))return Response.json({code:'Ok',durations:seed.map(()=>[600,300]),distances:seed.map(()=>[9000,4000])});
  if(String(url).includes('/route/'))return Response.json({code:'Ok',routes:[{geometry:{type:'LineString',coordinates:[[-80.25,35.82],[-80.28,35.87]]}}]});
  throw new Error('Unexpected outbound URL '+url);
 };
 try{
  for(const a of seed)await env.DB.prepare('INSERT INTO areas VALUES(?,?,?)').bind(a.id,JSON.stringify(a),Date.now()).run();
  const place={lat:35.824,lon:-80.253,label:'2 N Main St Lexington NC',input:sample.buyer_guide__work_address_or_city,approximate:false};
  await env.DB.prepare('INSERT INTO geo_cache VALUES(?,?,?)').bind('geo:'+sample.buyer_guide__work_address_or_city.toLowerCase()+':',JSON.stringify(place),Date.now()+100000).run();
  // Avoid unnecessary external POI lookup in the unit flow.
  const body={...sample,buyer_guide___everyday_places:'',request_key:'request-key-valid-1234'};
  // Required place data must survive validation.
  body.buyer_guide___everyday_places='Food Lion, Lexington NC';
  const viewbox=`${place.lon-0.6},${place.lat+0.5},${place.lon+0.6},${place.lat-0.5}`;
  for(const q of ['Food Lion','Lexington NC'])await env.DB.prepare('INSERT INTO geo_cache VALUES(?,?,?)').bind('geo:'+q.toLowerCase()+':'+viewbox,JSON.stringify({...place,input:q}),Date.now()+100000).run();
  const bad=new Request(ORIGIN+'/api/intake',{method:'POST',headers:{Origin:'https://bad.example','Content-Type':'application/json'},body:JSON.stringify(body)});
  assert.equal((await worker.fetch(bad,env,ctx)).status,403);
  let r=await req('/api/intake',body);assert.equal(r.status,201);const result=await r.json();await settle();
  const duplicate=await req('/api/intake',body);assert.equal((await duplicate.json()).id,result.id);
  assert.equal((await env.DB.prepare('SELECT count(*) n FROM leads').first()).n,1);
  assert.equal(sent.length,1);assert.equal(sent[0].to,sample.email);
  assert.equal((await req('/api/admin/overview')).status,401);
  assert.ok((await (await req('/move-plan/'+result.id)).text()).includes('Open your private Move Plan'));
  const verifyToken=sent[0].text.match(/#token=([a-f0-9]+)/)[1];
  r=await req('/api/verify',{token:verifyToken});assert.equal(r.status,200);const buyerCookie=r.headers.get('Set-Cookie').split(';')[0];await settle();
  const lead=await env.DB.prepare('SELECT * FROM leads WHERE id=?').bind(result.id).first();assert.equal(lead.status,'DRAFT');assert.equal(lead.hubspot_status,'confirmed');
  assert.equal(JSON.parse(lead.plan).areas.length,4);assert.equal(JSON.parse(lead.plan).warnings.length,0);
  assert.equal((await req('/api/verify',{token:verifyToken})).status,400);
  assert.equal((await req('/move-plan/'+result.id,undefined,buyerCookie)).status,404);
  await req('/api/admin-login',{});await settle();const adminToken=sent.findLast(s=>s.subject.includes('dashboard')).text.match(/#token=([a-f0-9]+)/)[1];
  r=await req('/api/verify',{token:adminToken});const adminCookie=r.headers.get('Set-Cookie').split(';')[0];
  assert.equal((await req('/api/admin/overview',undefined,adminCookie)).status,200);
  const plan=JSON.parse(lead.plan);const save=await req('/api/admin/save',{id:lead.id,revision:1,plan,note:'Looking forward to comparing these with you.'},adminCookie);assert.equal(save.status,200);
  assert.equal((await req('/api/admin/approve',{id:lead.id,revision:1},adminCookie)).status,409);
  const outcomes=await Promise.all([req('/api/admin/approve',{id:lead.id,revision:2,deliverAt:Date.now()+100000},adminCookie),req('/api/admin/approve',{id:lead.id,revision:2,deliverAt:Date.now()+100000},adminCookie)]);
  assert.deepEqual(outcomes.map(r=>r.status).sort(),[200,409]);await settle();
  assert.equal((await env.DB.prepare("SELECT count(*) n FROM outbox WHERE type='plan'").first()).n,1);
  assert.ok((await (await req('/move-plan/'+lead.id,undefined,buyerCookie)).text()).includes('Locations worth a closer look'));
  assert.ok((await (await req('/move-plan/'+'e'.repeat(64),undefined,buyerCookie)).text()).includes('Open your private Move Plan'));
  await env.DB.prepare("UPDATE outbox SET available_at=0 WHERE type='plan'").run();
  env.EMAIL.send=async()=>{throw new Error('Delivery refused');};await drain(env);
  assert.equal((await env.DB.prepare('SELECT status FROM leads').first()).status,'APPROVED');
  assert.equal((await env.DB.prepare("SELECT state FROM outbox WHERE type='plan'").first()).state,'failed');
  env.EMAIL.send=async m=>{sent.push(m);return {messageId:'plan-sent'};};
  const job=await env.DB.prepare("SELECT id FROM outbox WHERE type='plan'").first();
  await req('/api/admin/retry-delivery',{id:job.id},adminCookie);await settle();
  assert.equal((await env.DB.prepare('SELECT status FROM leads').first()).status,'SENT');
  assert.ok(sent.at(-1).text.includes('Looking forward to comparing these with you.'));
 }finally{globalThis.fetch=originalFetch;}
});
test('stale evidence, budget, yard and separation prevent unsupported matches',()=>{
 const b={budget:400000,beds:3,home:'Existing single-family home',yard:'An acre or more',city:'Lexington',priority:'A shorter drive to work'};
 assert.equal(eligible(seed[0],b),false);
 assert.equal(eligible({...seed[0],acres:2,checkedAt:'2020-01-01'},b),false);
 const c=seed.map((a,i)=>({...a,workRoute:{minutes:20-i},stopMinutes:10}));
 const chosen=rankAndChoose([...c,{...c[0],id:'too-close'}],b);assert.equal(chosen.length,4);assert.equal(chosen.filter(x=>x.id==='too-close').length,0);
 assert.ok(approvalProblems({welcome:'Hello',areas:[]}).length);
});
