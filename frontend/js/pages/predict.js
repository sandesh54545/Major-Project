function renderPredict(root) {
  root.innerHTML = `
    <div class="grid-2">
      <div class="card">
        <div class="sec-head"><div><div class="sec-title">Shipment Delay Predictor</div><div class="sec-sub">XGBoost model — trained on 50,000 records</div></div></div>
        <div class="form-group"><label class="form-label">Origin Port</label>
          <select id="p-origin"><option>Mumbai</option><option>Shanghai</option><option>Dubai</option><option>Hamburg</option><option>Los Angeles</option><option>Tokyo</option></select></div>
        <div class="form-group"><label class="form-label">Destination Port</label>
          <select id="p-dest"><option>Los Angeles</option><option>New York</option><option>Rotterdam</option><option>Tokyo</option><option>Sydney</option><option>Mumbai</option></select></div>
        <div class="form-group"><label class="form-label">Carrier</label>
          <select id="p-carrier"><option>Maersk</option><option>MSC</option><option>CMA CGM</option><option>COSCO</option><option>Hapag-Lloyd</option></select></div>
        <div class="form-group"><label class="form-label">Cargo Type</label>
          <select id="p-cargo"><option>Electronics</option><option>Perishables</option><option>Industrial Parts</option><option>Textiles</option><option>Chemicals</option></select></div>
        <div class="form-group"><label class="form-label">Departure Date</label>
          <input type="date" id="p-date" value="${new Date().toISOString().split('T')[0]}"></div>
        <div class="form-group"><label class="form-label">Weight (kg)</label>
          <input type="number" id="p-weight" value="12500" min="100" max="50000"></div>
        <button class="btn btn-primary" style="width:100%;margin-top:4px" onclick="runPrediction()">⊕ Run ML Prediction</button>
      </div>

      <div>
        <div class="card mb-12" id="pred-result">
          <div class="sec-title mb-12">Prediction Output</div>
          <div id="pred-waiting" style="text-align:center;padding:30px;color:var(--text2);font-size:13px">
            Configure parameters and click Run ML Prediction
          </div>
          <div id="pred-output" style="display:none">
            <div style="display:flex;gap:12px;margin-bottom:14px">
              <div style="flex:1;background:var(--bg3);border-radius:8px;padding:14px;text-align:center">
                <div class="metric-label">Delay Probability</div>
                <div id="pred-delay-val" class="metric-val text-red">--</div>
              </div>
              <div style="flex:1;background:var(--bg3);border-radius:8px;padding:14px;text-align:center">
                <div class="metric-label">Expected Delay</div>
                <div id="pred-days-val" class="metric-val text-yellow">--</div>
              </div>
              <div style="flex:1;background:var(--bg3);border-radius:8px;padding:14px;text-align:center">
                <div class="metric-label">Risk Level</div>
                <div id="pred-risk-level" class="metric-val" style="font-size:16px">--</div>
              </div>
            </div>
            <div class="mb-12">
              <div class="sec-sub mb-8">Feature Importance (SHAP)</div>
              <div id="shap-bars"></div>
            </div>
            <div id="pred-alert"></div>
          </div>
        </div>

        <div class="card">
          <div class="sec-title mb-12">Inventory Shortage Check</div>
          <div class="form-group"><label class="form-label">SKU ID</label>
            <input type="text" id="inv-sku" placeholder="e.g. SKU-8821"></div>
          <div class="form-group"><label class="form-label">Current Stock (units)</label>
            <input type="number" id="inv-stock" value="450"></div>
          <div class="form-group"><label class="form-label">Avg Daily Demand</label>
            <input type="number" id="inv-demand" value="85"></div>
          <div class="form-group"><label class="form-label">Lead Time (days)</label>
            <input type="number" id="inv-lead" value="7"></div>
          <button class="btn btn-primary" style="width:100%" onclick="checkInventory()">Check Shortage Risk</button>
          <div id="inv-result" style="margin-top:12px;display:none"></div>
        </div>
      </div>
    </div>`;
}

function runPrediction() {
  const origin   = document.getElementById('p-origin').value;
  const dest     = document.getElementById('p-dest').value;
  const carrier  = document.getElementById('p-carrier').value;
  const cargo    = document.getElementById('p-cargo').value;
  const weight   = parseInt(document.getElementById('p-weight').value) || 12500;
  const dateStr  = document.getElementById('p-date').value;
  const month    = dateStr ? new Date(dateStr).getMonth() + 1 : 5;

  // Simulate XGBoost prediction logic
  let base = Math.random() * 35 + 10;
  if (cargo === 'Perishables')   base += 18;
  if (weight > 20000)            base += 12;
  if ([6,7,8,9].includes(month)) base += 15;  // typhoon season
  if (origin === 'Mumbai' && dest === 'Los Angeles') base += 18;
  if (carrier === 'COSCO')       base += 8;

  const prob     = Math.min(95, Math.round(base));
  const delayDays = prob > 50 ? (prob / 100 * 5).toFixed(1) : (prob / 100 * 2).toFixed(1);

  const factors = [
    { name: 'Weather / Season',  val: Math.round(15 + Math.random() * 20) },
    { name: 'Route Congestion',  val: Math.round(12 + Math.random() * 18) },
    { name: 'Port Efficiency',   val: Math.round(10 + Math.random() * 15) },
    { name: 'Carrier History',   val: Math.round(8  + Math.random() * 12) },
    { name: 'Cargo Type',        val: cargo === 'Perishables' ? 18 : Math.round(5 + Math.random() * 10) },
    { name: 'Weight Factor',     val: Math.min(15, Math.round(weight / 50000 * 20)) },
  ];
  const total = factors.reduce((s, f) => s + f.val, 0);

  document.getElementById('pred-waiting').style.display = 'none';
  document.getElementById('pred-output').style.display  = 'block';
  document.getElementById('pred-delay-val').textContent = prob + '%';
  document.getElementById('pred-days-val').textContent  = delayDays + 'd';

  const rlEl = document.getElementById('pred-risk-level');
  const rl   = prob >= 60 ? 'HIGH' : prob >= 30 ? 'MEDIUM' : 'LOW';
  rlEl.textContent = rl;
  rlEl.style.color = prob >= 60 ? 'var(--red)' : prob >= 30 ? 'var(--yellow)' : 'var(--green)';

  document.getElementById('shap-bars').innerHTML = factors.map(f => {
    const pct = Math.round(f.val / total * 100);
    return `<div class="mb-8">
      <div class="d-flex justify-between mb-4" style="font-size:11px"><span>${f.name}</span><span class="mono text-yellow">${pct}%</span></div>
      <div class="bar-wrap"><div class="bar-fill" style="width:${pct}%;background:var(--yellow)"></div></div>
    </div>`;
  }).join('');

  const alertEl = document.getElementById('pred-alert');
  if (prob >= 60) {
    alertEl.className = 'alert alert-red';
    alertEl.innerHTML = '<span class="alert-icon" style="color:var(--red)">⚠</span><div><strong>High Risk Detected</strong><span>Consider alternate routing or early dispatch to mitigate delay risk.</span></div>';
  } else if (prob >= 30) {
    alertEl.className = 'alert alert-yellow';
    alertEl.innerHTML = '<span class="alert-icon" style="color:var(--yellow)">◎</span><div><strong>Moderate Risk</strong><span>Monitor closely and have contingency plan ready.</span></div>';
  } else {
    alertEl.className = 'alert alert-green';
    alertEl.innerHTML = '<span class="alert-icon" style="color:var(--green)">✓</span><div><strong>Low Risk</strong><span>Shipment is expected to arrive on schedule.</span></div>';
  }
}

function checkInventory() {
  const stock  = parseInt(document.getElementById('inv-stock').value)  || 0;
  const demand = parseFloat(document.getElementById('inv-demand').value) || 1;
  const lead   = parseInt(document.getElementById('inv-lead').value)   || 7;
  const sku    = document.getElementById('inv-sku').value || 'SKU-XXXX';
  const days   = Math.floor(stock / demand);
  const reorderQty = Math.round(demand * 30);
  const safetyStock = Math.round(demand * lead * 1.5);

  let cls, html;
  if (days <= 7) {
    cls  = 'alert alert-red';
    html = `<strong>CRITICAL — ${days} days until stockout for ${sku}</strong><span>Emergency reorder needed. Suggested qty: ${reorderQty.toLocaleString()} units. Safety stock: ${safetyStock.toLocaleString()} units.</span>`;
  } else if (days <= 21) {
    cls  = 'alert alert-yellow';
    html = `<strong>WARNING — ${days} days of stock remaining for ${sku}</strong><span>Plan reorder within 7 days. Suggested qty: ${reorderQty.toLocaleString()} units.</span>`;
  } else {
    cls  = 'alert alert-green';
    html = `<strong>OK — ${days} days of coverage for ${sku}</strong><span>Stock levels adequate. Next review in 14 days.</span>`;
  }
  const r = document.getElementById('inv-result');
  r.className = cls; r.innerHTML = html; r.style.display = 'flex'; r.style.gap = '10px';
}
