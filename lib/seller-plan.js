const site = require('../config/site');
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const page = {
  url:'/seller-improvement-plan/', slug:'seller-improvement-plan', sellerPlan:true,
  title:'What Should I Fix Before Selling? Free Triad Guide',
  description:'Get Toby Russell’s seller ROI guide and renovation worksheet, then request a Triad home CMA and property-specific repair-priority review.',
  dateModified:'2026-11-22'
};
function render(page, layout) {
  const faq = [
    {question:'What will I see after submitting?',answer:'You will go straight to the full improvement guide, including national and South Atlantic cost-recovery research, project-by-project advice and a printable renovation math worksheet.'},
    {question:'Will I receive an instant CMA?',answer:'Toby will follow up to confirm the address, condition and your goals, then review comparable sales before preparing a CMA. The improvement guide is available immediately.'},
    {question:'Can I ask about selling in current condition?',answer:'Yes. Choose the as-is option or mention it in your message so Toby can compare current-condition pricing with targeted preparation and larger repairs.'}
  ];
  const body = `<section class="container seller-plan" data-seller-plan data-guide-url="/guides/fix-up-house-before-selling/">
    <div class="seller-plan-copy"><p class="eyebrow">FREE SELLER ROI GUIDE · TRIAD NC</p><h1>Don’t remodel the wrong thing before you sell.</h1>
    <p class="lead">A higher sale price does not always mean more money in your pocket. Get the guide that helps you compare the project cost, value created, extra time and likely net result.</p>
    <div class="seller-preview"><p class="eyebrow">THE SHORT VERSION</p><h2>Start cheap. Fix problems. Price the big work first.</h2><ol><li><strong>Clear, clean and repair.</strong> Make the house easy to see and remove obvious distractions.</li><li><strong>Use cosmetics selectively.</strong> Paint, lighting, hardware and curb appeal can help when they solve a visible problem.</li><li><strong>Be careful with major remodels.</strong> National studies show many large kitchens, baths and additions recover only part of their cost.</li></ol></div>
    <h2>What the full guide includes</h2><ul><li>National and South Atlantic benchmarks from 2025 Zonda research.</li><li>2025 NAR/NARI cost-recovery and seller-preparation findings.</li><li>Cost bands, effort, when each project makes sense and when to skip it.</li><li>A printable worksheet that calculates incremental value, net gain and ROI.</li></ul>
    <p>Toby reviews your property details before preparing individual recommendations.</p>
    <img src="/assets/toby-headshot-480.webp" alt="Toby Russell, Triad North Carolina real estate broker" width="480" height="480" loading="lazy" class="seller-plan-portrait">
    </div>
    <aside class="seller-plan-request" aria-labelledby="seller-request-title"><p class="eyebrow">GET THE COMPLETE GUIDE</p><h2 id="seller-request-title">Where should I send your seller plan?</h2>
    <p class="seller-required">Please provide <strong>your name, phone, email and the property address</strong>. Those four items are required so Toby can connect the guide request to the right house.</p>
    <label for="seller-address">Property address <span aria-hidden="true">*</span></label><input id="seller-address" name="seller-address" type="text" autocomplete="street-address" required placeholder="Street address, city and ZIP" aria-describedby="seller-address-help"><p class="fine" id="seller-address-help">This address is attached to your seller-guide request. Please do not enter access codes or other sensitive details.</p>
    <label for="seller-service">What would you like help with?</label><select id="seller-service"><option value="Guide, CMA and repair-priority review">Guide + CMA + repair-priority review</option><option value="Guide and CMA">Guide + comparative market analysis</option><option value="Guide and repair-priority review">Guide + which repairs should I do?</option><option value="Guide and as-is option comparison">Guide + compare an as-is option</option><option value="Guide only">Just send me the guide</option></select>
    <p>Complete the HubSpot form below with your name, email and phone. Use its final question to tell Toby which situation best matches your plans.</p>
    <script src="/assets/seller-plan.js" defer></script><script src="https://js.hsforms.net/forms/embed/44205664.js" defer></script>
    <div class="hubspot-form-shell"><div class="hs-form-frame" data-region="na1" data-form-id="87a347c6-6db2-4e54-8680-6f7a938a85af" data-portal-id="44205664"></div></div>
    <p data-seller-error hidden role="alert">Your request could not be confirmed. Please try again or contact Toby below.</p>
    <div data-seller-confirmation hidden role="status"><p>Your request was received. <a href="/guides/fix-up-house-before-selling/">Open your improvement guide</a>.</p></div>
    <noscript><p>Enable JavaScript to submit the form, or call or email Toby to request your seller review.</p></noscript>
    <p class="fine">Submitting requests the guide and authorizes Toby to respond about this property. Your inquiry is sent through HubSpot. <a href="/privacy/">Privacy details</a></p>
    <p>Need help with the form? <a href="tel:${site.phone.replaceAll('-','')}">Call ${esc(site.phone)}</a> or <a href="mailto:${esc(site.email)}">email Toby</a>.</p>
    </aside></section>
    <section class="seller-proof container narrow"><p class="eyebrow">ONE NUMBER TO REMEMBER</p><h2>Money spent is not value created.</h2><p>If you spend $30,000 and the market would only pay $18,000 more, the project did not “add $30,000.” It created an estimated $18,000 in value before time, carrying costs and selling-cost changes. The worksheet makes that gap visible.</p></section>
    <section class="faq container narrow"><h2>Questions before you start</h2>${faq.map(item=>`<details><summary>${esc(item.question)}</summary><p>${esc(item.answer)}</p></details>`).join('')}<p><a href="/guides/fix-up-house-before-selling/">Already requested it? Open the full guide</a></p></section>`;
  return layout(page, body, faq).replace('</head>','<link rel="stylesheet" href="'+new URL(site.origin).pathname.replace(/\/$/,'')+'/assets/seller-plan.css"></head>');
}
module.exports = {page, render};
