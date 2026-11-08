export const OWNER = 'tobymrussell@gmail.com';
export const ORIGIN = 'https://move.triadhomesliving.com';
export const GUIDE = 'https://triadhomesliving.com/guides/moving-to-lexington-nc/';
export const fields = [
 ['firstname','First name','text'], ['lastname','Last name','text'], ['email','Email','email'], ['phone','Phone (optional)','tel',false],
 ['buyer_guide__area_of_interest','City you’re most interested in','text'],
 ['buyer_guide__moving_from','Where are you moving from?','text'],
 ['buyer_guide__work_address_or_city','Work address or city','text'],
 ['buyer_guide__maximum_commute_minutes','Maximum one-way commute in minutes','number'],
 ['buyer_guide___everyday_places','Places you visit most','textarea'],
 ['buyer_guide___maximum_home_budget','Maximum home budget','number'],
 ['buyer_guide__minimum_bedrooms','Minimum bedrooms','number'],
 ['buyer_guide__home_type','Home type',['Existing single-family home','New construction single-family home','Townhome','Condo','Open to more than one type']],
 ['buyer_guide__yard_preference','Yard preference',['Low maintenance or little yard','A good-sized yard','An acre or more','Several acres','Open to different lot sizes']],
 ['buyer_guide__main_priority','What matters most?',['A shorter drive to work','Convenience to everyday stops','More home for the money','More yard or land','New construction','A balance of these priorities']],
 ['buyer_guide__preapproval_status','Pre-approval status',['Yes, already preapproved','Not yet','Paying cash']],
 ['buyer_guide__lender_introduction','Would you like a lender introduction?',['Yes, please introduce me to a lender','No, thank you','Not applicable - preapproved or paying cash']],
 ['buyer_guide__moving_timeline','Moving timeline',['Within 3 months','3-6 months','6-12 months','More than a year','Just starting to explore']],
 ['buyer_guide__custom_home_search_request','Would you like a customized home search?',['Yes, please set up my customized search','I would like to talk through my options first','Just the buyer guide for now']],
 ['buyer_guide__must_haves_and_routine','Anything else about the home or your routine?','textarea',false]
];
export function cleanInput(input) {
 const out = {};
 for (const [key,label,type,required = true] of fields) {
  let value = String(input[key] ?? '').trim();
  if (value.length > (type === 'textarea' ? 2000 : 300)) throw new Error(`${label} is too long.`);
  if (required && !value) throw new Error(`Please fill in ${label.toLowerCase()}.`);
  if (Array.isArray(type) && !type.includes(value)) throw new Error(`Please choose ${label.toLowerCase()}.`);
  if (type === 'number') {
   const number = Number(value);
   const max = key.includes('budget') ? 50000000 : key.includes('bedrooms') ? 30 : 240;
   if (!Number.isFinite(number) || number < 1 || number > max || !Number.isInteger(number)) throw new Error(`Please check ${label.toLowerCase()}.`);
   value = String(number);
  }
  out[key] = value;
 }
 out.email = out.email.toLowerCase();
 if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(out.email)) throw new Error('Please enter a valid email.');
 if (out.phone) {
  const digits = out.phone.replace(/\D/g, '').replace(/^1(?=\d{10}$)/,'');
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(digits) || /^(\d)\1{9}$/.test(digits) || digits.slice(3,6)==='555') throw new Error('Please enter a valid 10-digit phone number or leave it blank.');
  out.phone = digits;
 }
 if (/^(home|home work|work from home|n\/?a|none)$/i.test(out.buyer_guide__work_address_or_city)) throw new Error('Please enter your work city or street address so Toby can compare routes.');
 return out;
}
export function buyer(data) {
 return {first:data.firstname, last:data.lastname,email:data.email,city:data.buyer_guide__area_of_interest, work:data.buyer_guide__work_address_or_city,commute:Number(data.buyer_guide__maximum_commute_minutes),budget:Number(data.buyer_guide___maximum_home_budget),beds:Number(data.buyer_guide__minimum_bedrooms),home:data.buyer_guide__home_type,yard:data.buyer_guide__yard_preference,priority:data.buyer_guide__main_priority,places:data.buyer_guide___everyday_places.split(',').map(x=>x.trim()).filter(Boolean).slice(0,5),timeline:data.buyer_guide__moving_timeline,preapproval:data.buyer_guide__preapproval_status,search:data.buyer_guide__custom_home_search_request,lender:data.buyer_guide__lender_introduction};
}
export function distance(a,b) {
 const radians = n=>n*Math.PI/180;
 const dlat=radians(b.lat-a.lat),dlon=radians(b.lon-a.lon);
 const v=Math.sin(dlat/2)**2+Math.cos(radians(a.lat))*Math.cos(radians(b.lat))*Math.sin(dlon/2)**2;
 return 3958.8*2*Math.atan2(Math.sqrt(v),Math.sqrt(1-v));
}
export const cityKey = text => text.toLowerCase().replace(/[^a-z]/g,'').replace(/northcarolina$|nc$/,'').replace('winstonsalem','winston');
export function eligible(area,b,now=Date.now()) {
 if (!area.active || !area.source || !Number.isFinite(Date.parse(area.checkedAt)) || Date.parse(area.checkedAt)>now+86400000 || now - Date.parse(area.checkedAt)>30*86400000 || !Number.isFinite(area.lat) || !Number.isFinite(area.lon)) return false;
 if (!(area.price>0) || area.price>b.budget || area.beds<b.beds) return false;
 if (!b.home.startsWith('Open') && area.homeType!==b.home && !(area.homeType==='Single-family home' && b.home.includes('single-family'))) return false;
 const minLot = {'A good-sized yard':0.25,'An acre or more':1,'Several acres':3}[b.yard] || 0;
 if (minLot && !(area.acres>=minLot)) return false;
 if (b.yard==='Low maintenance or little yard' && area.acres>0.25) return false;
 return true;
}
export function rankAndChoose(candidates,b) {
 const priority=b.priority;
 const sorted=[...candidates].sort((a,c)=>{
  if (priority==='A shorter drive to work') return a.workRoute.minutes-c.workRoute.minutes || a.price-c.price;
  if (priority==='Convenience to everyday stops') return a.stopMinutes-c.stopMinutes || a.workRoute.minutes-c.workRoute.minutes;
  if (priority==='More yard or land') return c.acres-a.acres || a.price-c.price;
  return a.price-c.price || c.sqft-a.sqft || c.acres-a.acres || a.workRoute.minutes-c.workRoute.minutes;
 });
 const preferred=sorted.filter(a=>cityKey(a.city)===cityKey(b.city));
 const nearby=sorted.filter(a=>cityKey(a.city)!==cityKey(b.city));
 const chosen=[];
 function take(pool,count) {
  for (const a of pool) {
   if (chosen.length>=count) break;
   if (!chosen.includes(a) && chosen.every(c=>distance(c,a)>=2)) chosen.push(a);
  }
 }
 take(preferred,2);take(nearby,4);take(sorted,4);
 return chosen.map((a,i)=>({...a,label:String.fromCharCode(65+i),group:cityKey(a.city)===cityKey(b.city)?'Your preferred city':'Nearby option'}));
}
export function validateArea(input) {
 const a={...input};
 if (!/^[\w-]{1,80}$/.test(a.id||'')) throw new Error('Use a short area ID with letters, numbers, or hyphens.');
 for (const k of ['title','city','address','source','checkedAt','homeType']) if (typeof a[k]!=='string'||!a[k].trim()||a[k].length>600) throw new Error(`Area needs ${k}.`);
 if (!/^https:\/\//.test(a.source)) throw new Error('Source must be an HTTPS link.');
 if (!Number.isFinite(Date.parse(a.checkedAt))) throw new Error('Set the evidence date.');
 for (const k of ['lat','lon','price','beds','acres','sqft']) if (!Number.isFinite(a[k])) throw new Error(`Area needs a numeric ${k}.`);
 if (a.lat<33||a.lat>37||a.lon< -84||a.lon> -75||a.price<1||a.beds<1||a.acres<0||a.sqft<1) throw new Error('Check the area coordinates and home figures.');
 a.active = a.active===true;
 return a;
}
export function approvalProblems(plan,b) {
 const problems=[];
 if (!plan?.welcome?.trim()) problems.push('Add a personal welcome.');
 if ((plan?.areas?.length||0)<4) problems.push('Choose at least four supported sample locations.');
 if (!plan?.areas?.some(a=>a.group==='Nearby option')) problems.push('Include a nearby-city option.');
 for (const a of plan?.areas||[]) {
  try{validateArea(a);}catch{problems.push('Check the sample location data.');}
  if(b&&(!eligible(a,b)||a.workRoute?.minutes>b.commute))problems.push('A location no longer fits the buyer’s criteria.');
  if(!a.path?.coordinates?.length||!Number.isFinite(a.workRoute?.minutes)||!Number.isFinite(Date.parse(a.workRoute?.checkedAt)))problems.push('Each location needs a calculated road route.');
  if (!a.note?.trim()||!a.workRoute?.minutes||!a.source||!a.checkedAt||Date.now()-Date.parse(a.checkedAt)>30*86400000) problems.push(`Refresh the evidence and route for ${a.title}.`);
 }
 for(let i=0;i<(plan?.areas?.length||0);i++) for(let j=0;j<i;j++) if(distance(plan.areas[i],plan.areas[j])<2) problems.push('Sample locations must be at least two miles apart.');
 if (plan?.warnings?.length) problems.push('Resolve the draft warnings by updating the area data and regenerating, or editing the plan after checking each item.');
 return [...new Set(problems)];
}
