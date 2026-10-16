const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const site=require('../config/site'),b=require('../config/brokerage'),c=require('../lib/content');
const pages=[...c.pages,...c.guides().map(g=>({...g,url:'/guides/'+g.slug+'/'}))];
const prefix=new URL(site.origin).pathname.replace(/\/$/,'');
function stripPrefix(url){assert(!prefix||url.startsWith(prefix+'/'),'Internal URL lacks project prefix: '+url);return prefix?url.slice(prefix.length):url;}
const titles=new Set(),descs=new Set(),keywords=new Set();let checkedLinks=0,faqPages=0;
function decode(s){return s.replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>');}
for(const p of pages){
 const file='dist'+(p.url==='/'?'/index.html':p.url+'index.html'),html=fs.readFileSync(file,'utf8');
 const title=decode(html.match(/<title>(.*?)<\/title>/s)[1]);const desc=decode(html.match(/<meta name="description" content="(.*?)">/s)[1]);
 assert.equal(title,p.title,`Title mismatch: ${p.url}`);assert(title.length<=75,`Long title: ${p.url}`);assert(!titles.has(title),`Duplicate title ${title}`);titles.add(title);
 assert.equal(desc,p.description,`Description mismatch: ${p.url}`);assert(desc.length>=110&&desc.length<=170,`Description ${desc.length}: ${p.url}`);assert(!descs.has(desc),`Duplicate description ${p.url}`);descs.add(desc);
 assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,`h1: ${p.url}`);
 assert(html.includes(`<link rel="canonical" href="${site.origin+p.url}">`),`canonical ${p.url}`);
 let previous=0;for(const h of html.matchAll(/<h([1-6])(?:\s|>)/g)){const level=Number(h[1]);assert(level<=previous+1,`Skipped heading ${p.url}`);previous=level;}
 for(const img of html.matchAll(/<img\s+([^>]+)>/g)){assert(/alt="[^"\s][^"]*"/.test(img[1]),`alt ${p.url}`);assert(/width="\d+"/.test(img[1])&&/height="\d+"/.test(img[1]),`dimensions ${p.url}`);const src=stripPrefix(img[1].match(/src="(.*?)"/)[1]);assert(fs.existsSync('dist'+src),`missing ${src}`);}
 for(const match of html.matchAll(/href="(\/[^"]*)"/g)){const href=stripPrefix(decode(match[1]).split('#')[0]);const target='dist'+href+(href.endsWith('/')?'index.html':'');assert(fs.existsSync(target),`Broken link ${p.url} -> ${href}`);checkedLinks++;}
 for(const phone of html.matchAll(/\b\d{3}[-.]\d{3}[-.]\d{4}\b/g))assert.equal(phone[0],site.phone,`Wrong phone ${p.url}`);
 for(const tel of html.matchAll(/href="tel:([^"]+)"/g))assert.equal(tel[1].replace(/\D/g,''),site.phone.replace(/\D/g,''));
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);assert.equal(graph['@context'],'https://schema.org');assert(graph['@graph'].every(n=>!Array.isArray(n['@type'])||!(n['@type'].includes('Person')&&n['@type'].includes('RealEstateAgent'))),'Do not conflate person and local business');const crumbs=graph['@graph'].find(n=>n['@type']==='BreadcrumbList');if(crumbs)assert.equal(new Set(crumbs.itemListElement.map(x=>x.item)).size,crumbs.itemListElement.length,'Duplicate breadcrumb URL');
 assert(graph['@graph'].some(n=>n['@type']==='Organization'&&n.name===b.brokerageName));assert(graph['@graph'].some(n=>n['@type']==='WebSite'));
 if(p.url!=='/')assert(graph['@graph'].some(n=>n['@type']==='BreadcrumbList'));
 const faq=graph['@graph'].find(n=>n['@type']==='FAQPage');if(faq){faqPages++;assert.equal(faq.mainEntity.length,(html.match(/<details><summary>/g)||[]).length);for(const f of faq.mainEntity){assert(html.includes(f.name.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))));assert.equal(f.acceptedAnswer['@type'],'Answer');}}
 if(p.primaryKeyword){assert(/^\d{4}-\d{2}-\d{2}$/.test(p.datePublished)&&/^\d{4}-\d{2}-\d{2}$/.test(p.dateModified),'Guide dates');for(const a of p.areas)assert(c.areas.find(x=>x.slug===a)?.guides.includes(p.slug),'Missing area backlink '+p.slug);const key=p.primaryKeyword.toLowerCase().replace(/[^a-z0-9]/g,'');assert(!keywords.has(key),`duplicate keyword ${p.primaryKeyword}`);keywords.add(key);assert.equal(p.relatedGuides.length>=2&&p.relatedGuides.length<=4,true);for(const rel of p.relatedGuides)assert(c.guides().some(g=>g.slug===rel));}
 assert(html.includes(b.brokerageName)&&html.includes(b.brokerageDisclosure));
}
let files=[];function scan(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(['node_modules','dist','.git','.sites-runtime','.github'].includes(e.name))continue;const f=path.join(d,e.name);if(e.isDirectory())scan(f);else if(/\.(js|njk|md|json|css|txt)$/.test(f))files.push(f);}}scan('.');
const branded=files.filter(f=>fs.readFileSync(f,'utf8').includes(b.brokerageName));assert.deepEqual(branded,['config/brokerage.js']);
for(const f of files)for(const phone of fs.readFileSync(f,'utf8').matchAll(/\b\d{3}[-.]\d{3}[-.]\d{4}\b/g))assert.equal(phone[0],site.phone,`Phone in ${f}`);
const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');const indexablePages=pages.filter(p=>p.slug!=='404');assert.equal((sitemap.match(/<loc>/g)||[]).length,indexablePages.length);for(const p of indexablePages)assert(sitemap.includes(site.origin+p.url));assert(!sitemap.includes(site.origin+'/404/'),'404 must not be in sitemap');assert(fs.readFileSync('dist/404.html','utf8').includes('content="noindex,follow"'),'404 must not be indexed');
assert(fs.readFileSync('dist/robots.txt','utf8').includes('User-agent: CCBot\nAllow: /'));assert(fs.readFileSync('dist/llms.txt','utf8').includes(b.brokerageName));
console.log(JSON.stringify({pages:pages.length,guideKeywords:keywords.size,faqPages,checkedInternalLinks:checkedLinks,brokerageSourceFiles:branded,checks:'PASS'},null,2));
