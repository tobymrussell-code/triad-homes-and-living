(() => {
  const landing = document.querySelector('[data-seller-plan]');
  if (!landing) return;
  const formId = '87a347c6-6db2-4e54-8680-6f7a938a85af';
  const service = landing.querySelector('#seller-service');
  const address = landing.querySelector('#seller-address');
  const error = landing.querySelector('[data-seller-error]');
  let form;
  let submitted = false;
  const metadata = () => {
    try {
      form?.setExtraSubmissionMetadata({
        requested_service: service.value,
        property_address: address.value.trim(),
        landing_page: location.pathname,
        source_content: 'fix-up-house-before-selling'
      });
    } catch { /* The inquiry can still be submitted through the native form. */ }
  };
  service.addEventListener('change', metadata);
  address.addEventListener('change', metadata);
  window.addEventListener('hs-form-event:on-ready', event => {
    if (event.detail?.formId !== formId) return;
    try { form = window.HubSpotFormsV4?.getFormFromEvent(event); } catch {}
    metadata();
  });
  const complete = () => {
    if (submitted) return;
    if (!address.value.trim()) {
      error.textContent = 'Add the property address above so the guide request can be connected to the right house.';
      error.hidden = false;
      address.focus();
      return;
    }
    submitted = true;
    error.hidden = true;
    landing.querySelector('[data-seller-confirmation]').hidden = false;
    try {
      if (localStorage.getItem('triad-analytics-consent') === 'accepted') {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({event:'generate_lead', form_id:formId, form_location:location.pathname, service:'seller_review'});
      }
    } catch { /* Delivery is independent of optional analytics. */ }
    // Resolve from the script URL to support both custom domains and project-path hosting.
    const script = document.querySelector('script[src$="/assets/seller-plan.js"]');
    const guide = new URL('../guides/fix-up-house-before-selling/', script.src);
    location.assign(guide.href);
  };
  window.addEventListener('hs-form-event:on-submission:success', event => {
    if (event.detail?.formId === formId) complete();
  });
  window.addEventListener('hs-form-event:on-submission:failed', event => {
    if (event.detail?.formId === formId) error.hidden = false;
  });
  window.addEventListener('message', event => {
    if (!/^https:\/\/(?:[a-z0-9-]+\.)*(?:hsforms|hubspot)\.com$/i.test(event.origin)) return;
    let data = event.data;
    if (typeof data === 'string') { try { data = JSON.parse(data); } catch { return; } }
    if (data?.type === 'hsFormCallback' && data.eventName === 'onFormSubmitted' && (data.id || data.formId) === formId) complete();
  });
})();
