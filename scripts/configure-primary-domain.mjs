// Run only from the authorized Pages deployment after registrar delegation is active.
import {resolveNs} from 'node:dns/promises';
const domain='triadhomesandliving.com';
const expected=['damian.ns.cloudflare.com','desiree.ns.cloudflare.com'];
const nameservers=(await resolveNs(domain)).map(n=>n.toLowerCase().replace(/\.$/,''));
if(!expected.every(n=>nameservers.includes(n)))throw new Error('The new domain still needs its GoDaddy nameserver change. Keep the current website live.');
const repo='tobymrussell-code/triad-homes-and-living';
if(process.env.GITHUB_REPOSITORY!==repo||!process.env.GITHUB_TOKEN)throw new Error('Use the authorized repository deployment workflow.');
const endpoint='https://api.github.com/repos/'+repo+'/pages';
const headers={Authorization:'Bearer '+process.env.GITHUB_TOKEN,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'};
const current=await fetch(endpoint,{headers});if(!current.ok)throw new Error('Could not read Pages configuration: '+current.status);
const site=await current.json();
if(site.cname!==domain){const updated=await fetch(endpoint,{method:'PUT',headers,body:JSON.stringify({cname:domain})});if(!updated.ok)throw new Error('Could not update Pages custom domain: '+updated.status);}
console.log('Pages primary domain configured: '+domain);
