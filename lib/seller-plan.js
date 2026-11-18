const site = require('../config/site');
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const page = {
  url:'/seller-improvement-plan/', slug:'seller-improvement-plan', sellerPlan:true,
  title:'Home Improvement Plan and CMA Request | Toby Russell',
  description:'Selling a Triad NC home? Request a CMA and repair-priority review from Toby Russell, then explore research on improvements and estimated resale returns.',
  dateModified:'2026-11-18'
};
function render(page, layout) {
  const faq = [
    {question:'What will I see after submitting?',answer:'You will go straight to the improvement guide, including national and regional cost-recovery research, a seller checklist and ways to compare repair options.'},
    {question:'Will I receive an instant CMA?',answer:'Toby will follow up to confirm the address, condition and your goals, then review comparable sales before preparing a CMA. The improvement guide is available immediately.'},
    {question:'Can I ask about selling in current condition?',answer:'Yes. Include that in your message so Toby can compare current-condition pricing with targeted preparation and larger repairs.'}
  ];
  const body = `<section class="container seller-plan" data-seller-plan data-guide-url="/guides/fix-up-house-before-selling/">
    <div class="seller-plan-copy"><p class="eyebrow">SELLING YOUR TRIAD HOME</p><h1>Which repairs are worth your money?</h1>
    <p class="lead">Before you spend thousands getting ready to sell, let’s look at your home, your competition and what you could keep at closing.</p>
    <p>Request a comparative market analysis (CMA), a repair-priority review, or both. After submitting, you’ll go straight to the improvement guide with national and regional research.</p>
    <h2>Start with your house</h2><ul><li>Compare selling in current condition with doing the work.</li><li>Identify the updates worth pricing before you commit.</li><li>Review your timeline, upfront costs and estimated net.</li></ul>
    <p>Toby reviews your property details before preparing individual recommendations.</p>
    <img src="/assets/toby-headshot-480.webp" alt="Toby Russell, Triad North Carolina real estate broker" width="480" height="480" loading="lazy" class="seller-plan-portrait">
    </div>
    <aside class="seller-plan-request" aria-labelledby="seller-request-title"><h2 id="seller-request-title">Request your seller review</h2>
    <label for="seller-service">What would you like help with?</label><select id="seller-service"><option value="CMA and repair-priority review">CMA and repair-priority review</option><option value="CMA">Comparative market analysis (CMA)</option><option value="Repair-priority review">Which repairs should I do?</option></select>
    <p>In the message field, include your <strong>property address, current condition, work you’re considering and selling timeline</strong>. Please also state your selected service so Toby has it with your message.</p>
    <script src="/assets/seller-plan.js" defer></script><script src="https://js.hsforms.net/forms/embed/44205664.js" defer></script>
    <div class="hubspot-form-shell"><div class="hs-form-frame" data-region="na1" data-form-id="87a347c6-6db2-4e54-8680-6f7a938a85af" data-portal-id="44205664"></div></div>
    <p data-seller-error hidden role="alert">Your request could not be confirmed. Please try again or contact Toby below.</p>
    <div data-seller-confirmation hidden role="status"><p>Your request was received. <a href="/guides/fix-up-house-before-selling/">Open your improvement guide</a>.</p></div>
    <noscript><p>Enable JavaScript to submit the form, or call or email Toby to request your seller review.</p></noscript>
    <p class="fine">Your inquiry is sent through HubSpot so Toby can respond. <a href="/privacy/">Privacy details</a></p>
    <p>Need help with the form? <a href="tel:${site.phone.replaceAll('-','')}">Call ${esc(site.phone)}</a> or <a href="mailto:${esc(site.email)}">email Toby</a>.</p>
    </aside></section>
    <section class="faq container narrow"><h2>Questions before you start</h2>${faq.map(item=>`<details><summary>${esc(item.question)}</summary><p>${esc(item.answer)}</p></details>`).join('')}<p><a href="/guides/fix-up-house-before-selling/">Read the research guide</a></p></section>`;
  return layout(page, body, faq).replace('</head>','<link rel="stylesheet" href="'+new URL(site.origin).pathname.replace(/\/$/,'')+'/assets/seller-plan.css"></head>');
}
module.exports = {page, render};
