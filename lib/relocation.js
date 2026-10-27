const site = require('../config/site');
const brokerage = require('../config/brokerage');
const photos = require('../config/area-photos.json');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const cities = [
  {city:'Lexington',slug:'lexington-nc',lead:'Downtown, a subdivision, or a little more land? Let’s work out what fits your week before you start choosing houses.',photo:'lexington-nc',checks:[
    ['Start with your everyday routes.','Map work, groceries, and the trips you repeat. Test the route from each actual home, including the trip back.'],
    ['Compare the setting and the upkeep.','A downtown address, subdivision, and rural property can mean different responsibilities. Compare the lot, restrictions, and maintenance along with the floor plan.'],
    ['Check what comes with the address.','Confirm the parcel’s jurisdiction, taxes, utilities, internet, and any well or septic system. A Lexington mailing address does not settle those details.']
  ]},
  {city:'Thomasville',slug:'thomasville-nc',lead:'Get to know the map, the homes, and the questions worth asking. Then build a search around the way you actually live.',photo:'thomasville-nc',checks:[
    ['Put your commute on the map.','Compare routes from the actual property to work and regular errands. Check highway access and the times you expect to travel.'],
    ['Look beyond the listing photos.','Compare layout, parking, lot responsibilities, roof and system condition, and the work you may need to budget for.'],
    ['Compare nearby options consistently.','Look at Thomasville, Lexington, and High Point addresses using the same destinations, property priorities, and ownership budget.']
  ]}
];

const pages = cities.map(c => ({
  url:`/plan-your-move/${c.slug}/`,slug:`move-plan-${c.slug}`,city:c.city,citySlug:c.slug,relocation:true,
  title:`Plan Your ${c.city} NC Move | Toby Russell`,h1:`Moving to ${c.city}, NC?`,
  description:`Planning a move to ${c.city}, NC? Compare homes, everyday routes, property settings, and ownership questions, then ask Toby Russell to help plan your search.`,
  dateModified:'2026-10-27'
}));

function render(page, layout, logo) {
  const c=cities.find(item=>item.slug===page.citySlug);
  const p=photos[c.photo];
  const tel=`tel:${site.phone.replaceAll('-','')}`;
  const body=`<div class="move-landing" data-relocation-city="${esc(c.city)}">
    <section class="container move-hero">
      <div class="move-intro">
        <p class="eyebrow">${esc(c.city.toUpperCase())}, NORTH CAROLINA · BUYER RELOCATION</p>
        <h1>${esc(page.h1)}</h1>
        <p class="move-lead">${esc(c.lead)}</p>
        <a class="button move-primary" href="#move-request">Plan my ${esc(c.city)} move <span aria-hidden="true">↗</span></a>
        <p class="move-micro">A local conversation about your next home.</p>
        <figure class="move-city-photo">
          <img src="${p.src.replace('.webp','-800.webp')}" srcset="${p.src.replace('.webp','-480.webp')} 480w, ${p.src.replace('.webp','-800.webp')} 800w, ${p.src} 1200w" sizes="(max-width:800px) calc(100vw - 40px), 580px" alt="${esc(p.alt)}" width="1200" height="750" fetchpriority="high">
          <figcaption>${esc(p.alt)} · <a href="${esc(p.source)}">${esc(p.author)}</a> · <a href="${esc(p.licenseUrl)}">${esc(p.license)}</a> · Display crop</figcaption>
        </figure>
      </div>
      <aside class="move-request" id="move-request" aria-labelledby="move-request-title">
        <p class="eyebrow">LET’S MAKE THE MAP USEFUL</p>
        <h2 id="move-request-title">Plan your ${esc(c.city)} move.</h2>
        <p>Send your contact details below. I’ll follow up to talk about your timeline, the routes you need, and what you’re looking for in a home.</p>
        <p class="move-form-note">This starts a conversation with Toby. Your search plan comes from that conversation.</p>
        <div data-move-form>
          <div class="hubspot-form-shell"><div class="hs-form-frame" data-region="na1" data-form-id="87a347c6-6db2-4e54-8680-6f7a938a85af" data-portal-id="44205664"></div></div>
          <noscript><p>Please enable JavaScript to use the form, or call or text Toby below.</p></noscript>
        </div>
        <div class="move-confirmation" data-move-confirmation hidden tabindex="-1" role="status">
          <h2>Your request is in.</h2>
          <p>Thanks for reaching out about ${esc(c.city)}. Toby will follow up using the contact details you submitted.</p>
          <p>For now, write down your usual destinations and your top three home priorities. That gives us a useful place to start.</p>
        </div>
        <p class="move-form-error" data-move-error hidden role="alert">Your request wasn’t confirmed. Please check the form and try again, or call or text Toby below.</p>
        <p class="fine">Your inquiry is sent to Toby through HubSpot. Please do not include sensitive documents. <a href="/privacy/">Privacy details</a></p>
        <div class="move-direct"><span>Prefer to talk?</span><a href="${tel}">Call ${site.phone}</a><a href="sms:${site.phone.replaceAll('-','')}">Text Toby</a></div>
      </aside>
    </section>
    <section class="move-checks-band" aria-labelledby="move-checks-title">
      <div class="container">
        <p class="eyebrow">A QUICK LOOK BEFORE YOU TOUR</p>
        <h2 id="move-checks-title">Three things to work out<br>before you pick a house.</h2>
        <div class="move-checks">${c.checks.map(([title,text],i)=>`<article><span class="move-number">0${i+1}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`).join('')}</div>
        <p class="move-checks-note">Routes, services, taxes, restrictions, and property condition need checking for the actual address.</p>
        <a class="button" href="#move-request">Talk through my ${esc(c.city)} move <span aria-hidden="true">↗</span></a>
      </div>
    </section>
    <section class="container move-toby" aria-labelledby="move-toby-title">
      <img src="/assets/toby-headshot-480.webp" alt="Toby Russell, North Carolina real estate broker" width="480" height="480" loading="lazy">
      <div><p class="eyebrow">YOUR LOCAL POINT OF CONTACT</p><h2 id="move-toby-title">I’m Toby Russell.<br>Let’s talk through the map.</h2><p>I help buyers compare actual homes, everyday routes, and the work that comes with ownership. Bring the questions you have now. We can narrow the next step together.</p><p class="fine">${esc(site.title)} · North Carolina license ${esc(site.license)} · ${esc(brokerage.brokerageName)}</p><a class="button" href="#move-request">Plan my ${esc(c.city)} move</a></div>
    </section>
    <section class="container move-answers" aria-label="Questions about planning your move">
      <h2>A few questions you may have.</h2>
      <details><summary>What happens after I send my details?</summary><p>Toby will follow up to learn about your timeline, home priorities, and regular destinations. From there, you can discuss areas and properties worth comparing.</p></details>
      <details><summary>Can I reach out while I’m still researching?</summary><p>Yes. You can start with a rough timeline and the questions you’re trying to answer. A specific property is not required to begin a conversation.</p></details>
      <details><summary>Can we compare ${esc(c.city)} with nearby areas?</summary><p>Yes. Use the same home priorities, routes, and ownership budget to compare actual addresses across the Triad.</p></details>
      <p class="move-reading">Want more background first? <a href="/guides/moving-to-${c.slug}/">Read the ${esc(c.city)} moving guide</a>.</p>
    </section>
    <div class="move-mobile-cta"><a class="button" href="#move-request">Plan my ${esc(c.city)} move ↗</a></div>
  </div><script src="https://js.hsforms.net/forms/embed/44205664.js" defer></script>`;
  return layout(page,body);
}

module.exports={pages,render};
