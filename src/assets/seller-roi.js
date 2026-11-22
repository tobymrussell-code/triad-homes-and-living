(() => {
  const sheet = document.querySelector('[data-roi-sheet]');
  if (!sheet) return;
  const money = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', maximumFractionDigits:0});
  const number = name => Math.max(0, Number(sheet.elements[name]?.value) || 0);
  const out = (name, value) => { const node = sheet.querySelector(`[data-${name}]`); if (node) node.textContent = value; };
  const calculate = () => {
    const asIs = number('as_is_value');
    const improved = number('improved_value');
    const project = number('project_cost');
    const carrying = number('carrying_cost');
    const selling = number('selling_cost_impact');
    const valueCreated = improved - asIs;
    const allIn = project + carrying + selling;
    const netGain = valueCreated - allIn;
    const roi = allIn > 0 ? netGain / allIn * 100 : 0;
    let result = 'Enter your estimates';
    let detail = 'Use a property-specific CMA and written quotes before making the final decision.';
    if (asIs && improved && allIn) {
      if (netGain > Math.max(2500, allIn * .15)) { result = 'Worth a closer look'; detail = 'The estimates show a positive cushion. Verify the improved value, scope, schedule and contingency before committing.'; }
      else if (netGain >= 0) { result = 'Borderline'; detail = 'The projected gain is thin. A small overrun, delay or lower sale price could erase it.'; }
      else { result = 'Likely skip or reduce scope'; detail = 'These estimates show the work costing more than the incremental value it may create.'; }
    }
    out('value-created', money.format(valueCreated));
    out('all-in-cost', money.format(allIn));
    out('net-gain', money.format(netGain));
    out('roi', `${roi.toFixed(1)}%`);
    out('result', result);
    out('result-detail', detail);
  };
  sheet.addEventListener('input', calculate);
  sheet.addEventListener('change', calculate);
  sheet.addEventListener('reset', () => setTimeout(calculate));
  sheet.querySelector('[data-print-sheet]')?.addEventListener('click', () => window.print());
  calculate();
})();
