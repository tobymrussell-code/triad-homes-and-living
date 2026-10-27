(() => {
  const landing = document.querySelector('[data-relocation-city]');
  if (!landing) return;
  const formId = '87a347c6-6db2-4e54-8680-6f7a938a85af';
  const city = landing.dataset.relocationCity;
  const confirmation = landing.querySelector('[data-move-confirmation]');
  const error = landing.querySelector('[data-move-error]');
  let submitted = false;
  window.addEventListener('hs-form-event:on-ready', event => {
    if (event.detail?.formId !== formId) return;
    try {
      const form = window.HubSpotFormsV4?.getFormFromEvent(event);
      form?.setExtraSubmissionMetadata({requested_service:'Buyer relocation planning',requested_city:city,landing_page:location.pathname});
    } catch { /* The native form remains usable if metadata is unavailable. */ }
  });
  window.addEventListener('hs-form-event:on-submission:failed', event => {
    if (event.detail?.formId === formId) error.hidden = false;
  });
  window.addEventListener('hs-form-event:on-submission:success', event => {
    if (event.detail?.formId !== formId || submitted) return;
    submitted = true;
    error.hidden = true;
    landing.querySelector('[data-move-form]').hidden = true;
    confirmation.hidden = false;
    confirmation.focus();
    try {
      if (localStorage.getItem('triad-analytics-consent') !== 'accepted') return;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({event:'generate_lead',form_id:formId,form_location:location.pathname,service:'buyer_relocation',city});
    } catch { /* Lead receipt does not depend on optional analytics. */ }
  });
})();
