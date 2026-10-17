(() => {
 const root=document.documentElement;
 try { const pref=localStorage.getItem('toby-theme');if(pref==='light'||pref==='dark')root.dataset.theme=pref;}catch{}
 document.querySelector('.theme-button')?.addEventListener('click',()=>{const dark=root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;root.dataset.theme=dark?'light':'dark';try{localStorage.setItem('toby-theme',root.dataset.theme);}catch{}document.querySelector('.theme-button').setAttribute('aria-label',`Switch to ${dark?'dark':'light'} theme`);});
 const query=document.querySelector('#guide-query'),category=document.querySelector('#guide-category');
 if(query&&category){const filter=()=>{let count=0;const q=query.value.trim().toLowerCase(),c=category.value;document.querySelectorAll('[data-guide]').forEach(card=>{card.hidden=!!((q&&!card.dataset.search.includes(q))||(c&&card.dataset.category!==c));if(!card.hidden)count++;});document.querySelector('#guide-count').textContent=`${count} ${count===1?'guide':'guides'} to explore`;document.querySelector('#no-guides').hidden=count!==0;};query.addEventListener('input',filter);category.addEventListener('change',filter);}
 document.querySelectorAll('[data-load-map]').forEach(button=>button.addEventListener('click',()=>{const host=button.closest('[data-map-url]'),frame=document.createElement('iframe');frame.src=host.dataset.mapUrl;frame.title=host.dataset.mapTitle;frame.referrerPolicy='no-referrer-when-downgrade';frame.allowFullscreen=true;host.replaceChildren(frame);}));
 document.querySelectorAll('[data-review-carousel]').forEach(carousel=>{const track=carousel.querySelector('.review-track'),cards=[...track.children],controls=carousel.querySelector('.review-controls'),pause=carousel.querySelector('[data-review-pause]');let index=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;carousel.classList.add('enhanced');controls.hidden=false;const show=n=>{index=(n+cards.length)%cards.length;track.scrollTo({left:cards[index].offsetLeft-cards[0].offsetLeft,behavior:'auto'});};const update=()=>{pause.textContent=paused?'Play reviews':'Pause reviews';pause.setAttribute('aria-pressed',String(paused));};pause.addEventListener('click',()=>{paused=!paused;update();});carousel.querySelector('[data-review-prev]').addEventListener('click',()=>{paused=true;update();show(index-1);});carousel.querySelector('[data-review-next]').addEventListener('click',()=>{paused=true;update();show(index+1);});carousel.addEventListener('focusin',()=>{paused=true;update();});setInterval(()=>{if(!paused&&!document.hidden)show(index+1);},2000);window.addEventListener('resize',()=>show(index));update();});

 // Analytics is opt-in. No Google request is made until the visitor accepts.
 const GTM_ID='GTM-W6HWXD37', CONSENT_KEY='triad-analytics-consent', HUBSPOT_FORM_ID='87a347c6-6db2-4e54-8680-6f7a938a85af';
 let memoryChoice=null,gtmLoaded=false;
 window.dataLayer=window.dataLayer||[];
 const getChoice=()=>{try{return localStorage.getItem(CONSENT_KEY)||memoryChoice;}catch{return memoryChoice;}};
 const setChoice=value=>{memoryChoice=value;try{localStorage.setItem(CONSENT_KEY,value);}catch{}};
 const loadGtm=()=>{if(gtmLoaded)return;gtmLoaded=true;window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(GTM_ID);document.head.appendChild(script);};
 const track=(event,params={})=>{if(getChoice()==='accepted')window.dataLayer.push({event,...params});};
 const banner=document.createElement('section');
 banner.className='privacy-banner';banner.hidden=true;banner.setAttribute('role','region');banner.setAttribute('aria-labelledby','privacy-banner-title');
 banner.innerHTML='<div class="privacy-banner__copy"><h2 id="privacy-banner-title">Your privacy choices</h2><p>Allow optional analytics to help Toby understand which pages and site actions are useful. Analytics does not receive your form contents or direct contact details. You can change this choice later in Privacy settings.</p></div><div class="privacy-banner__actions"><button type="button" data-consent-reject>Reject optional analytics</button><button type="button" data-consent-accept>Accept analytics</button></div>';
 const settings=document.createElement('button');settings.type='button';settings.className='privacy-settings-button';settings.textContent='Privacy settings';settings.setAttribute('aria-label','Change optional analytics settings');
 document.body.append(banner,settings);
 const updateConsentUI=()=>{const open=!getChoice();banner.hidden=!open;settings.hidden=open;};
 const choose=value=>{setChoice(value);updateConsentUI();if(value==='accepted'){loadGtm();if(document.querySelector('.guide-body'))track('view_article',{content_type:'guide',page_path:location.pathname});}};
 banner.querySelector('[data-consent-accept]').addEventListener('click',()=>choose('accepted'));
 banner.querySelector('[data-consent-reject]').addEventListener('click',()=>choose('rejected'));
 settings.addEventListener('click',()=>{banner.hidden=false;settings.hidden=true;banner.querySelector('[data-consent-accept]').focus();});
 if(getChoice()==='accepted'){loadGtm();if(document.querySelector('.guide-body'))track('view_article',{content_type:'guide',page_path:location.pathname});}
 else updateConsentUI();

 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');if(!link)return;
  const href=link.getAttribute('href')||'',label=(link.textContent||'').trim().toLowerCase();
  if(href.startsWith('tel:'))track('contact_click',{contact_method:'phone',page_path:location.pathname});
  else if(href.startsWith('sms:'))track('contact_click',{contact_method:'text',page_path:location.pathname});
  else if(label.includes('valuation'))track('valuation_click',{page_path:location.pathname});
  else if(label.includes('market report'))track('market_report_click',{page_path:location.pathname});
  else if(label.includes('search')&&(/\/search\//.test(href)||link.classList.contains('button')))track('property_search_click',{page_path:location.pathname});
 },true);

 const handleHubSpotMessage=data=>{
  if(!data||data.type!=='hsFormCallback'||data.eventName!=='onFormSubmitted')return;
  const formId=data.id||data.formId;if(formId!==HUBSPOT_FORM_ID)return;
  track('generate_lead',{form_id:HUBSPOT_FORM_ID,form_location:location.pathname});
 };
 window.addEventListener('message',event=>{
  if(!/^https:\/\/(?:[a-z0-9-]+\.)*(?:hsforms|hubspot)\.com$/i.test(event.origin))return;
  let data=event.data;if(typeof data==='string'){try{data=JSON.parse(data);}catch{return;}}
  handleHubSpotMessage(data);
 });
 window.addEventListener('hsFormCallback',event=>handleHubSpotMessage(event.detail));
})();