// ── INVENTORY PAGE ────────────────────────────────────────────────────────────
function renderInventory(root) {
  root.innerHTML = `
    <div class="grid-4">
      <div class="card"><div class="metric-label">Total SKUs</div><div class="metric-val">1,842</div></div>
      <div class="card"><div class="metric-label">At Risk</div><div class="metric-val text-red">47</div></div>
      <div class="card"><div class="metric-label">Overstocked</div><div class="metric-val text-yellow">123</div></div>
      <div class="card"><div class="metric-label">Avg Coverage</div><div class="metric-val text-green">18.3d</div></div>
    </div>
    <div class="card mb-16">
      <div class="sec-head"><div class="sec-title">Demand Forecast vs Stock Levels</div><span class="tag tag-blue">Next 30 days</span></div>
      <div style="position:relative;height:200px"><canvas id="invChart"></canvas></div>
    </div>
    <div class="card">
      <div class="sec-head"><div class="sec-title">Critical Stock Items</div><span class="tag tag-red">Immediate action needed</span></div>
      <table>
        <thead><tr><th>SKU</th><th>Product</th><th>Stock</th><th>Daily Demand</th><th>Days Left</th><th>Risk</th><th>Action</th></tr></thead>
        <tbody>
          ${DEMO.inventory.map(item => `
          <tr>
            <td class="mono" style="font-size:11px">${item.sku_id}</td>
            <td>${item.product_name}</td>
            <td>${item.current_stock.toLocaleString()}</td>
            <td>${item.avg_daily_demand}</td>
            <td style="color:${item.days_to_stockout<=7?'var(--red)':item.days_to_stockout<=21?'var(--yellow)':'var(--green)'}">${item.days_to_stockout}d</td>
            <td><span class="${riskClass(item.risk_level)}">${item.risk_level}</span></td>
            <td>${item.days_to_stockout<=14
              ? `<button class="btn btn-sm btn-primary" onclick="reorder('${item.sku_id}')">Reorder</button>`
              : `<button class="btn btn-sm btn-outline">OK</button>`}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  destroyChart('invChart'); makeInventoryChart('invChart');
}

// ── SUPPLIERS PAGE ────────────────────────────────────────────────────────────
function renderSuppliers(root) {
  root.innerHTML = `
    <div class="grid-3">
      <div class="card"><div class="metric-label">Total Suppliers</div><div class="metric-val">84</div></div>
      <div class="card"><div class="metric-label">High Risk</div><div class="metric-val text-red">9</div></div>
      <div class="card"><div class="metric-label">Avg Reliability</div><div class="metric-val text-green">77%</div></div>
    </div>
    <div class="grid-2">
      <div class="card mb-16">
        <div class="sec-head"><div class="sec-title">Risk Scores by Supplier</div></div>
        <div style="position:relative;height:200px"><canvas id="supplierChart"></canvas></div>
      </div>
      <div class="card mb-16">
        <div class="sec-head"><div class="sec-title">Risk Score Trend</div><div class="sec-sub">Last 6 months</div></div>
        <div style="position:relative;height:200px"><canvas id="supplierTrend"></canvas></div>
      </div>
    </div>
    <div class="card">
      <div class="sec-head"><div class="sec-title">Supplier Risk Scorecard</div></div>
      <table>
        <thead><tr><th>Supplier</th><th>Region</th><th>On-Time %</th><th>Quality Score</th><th>Risk Score</th><th>Status</th></tr></thead>
        <tbody>
          ${DEMO.suppliers.map(s => `
          <tr>
            <td>${s.name}</td>
            <td>${s.region}</td>
            <td>${Math.round(s.on_time_rate*100)}%</td>
            <td>${s.quality_score}/100</td>
            <td style="color:${s.risk_score>=75?'var(--green)':s.risk_score>=50?'var(--yellow)':'var(--red)'}">${s.risk_score}</td>
            <td><span class="${riskClass(s.risk_level)}">${s.risk_level}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  destroyChart('supplierChart'); makeSupplierBarChart('supplierChart', DEMO.suppliers);
  destroyChart('supplierTrend'); makeSupplierTrendChart('supplierTrend');
}

// ── SHIPMENTS PAGE ────────────────────────────────────────────────────────────
function renderShipments(root) {
  const routes  = ['US-CN','US-EU','US-IN','EU-CN','EU-IN','AS-US','ME-EU'];
  const weeks   = ['W1','W2','W3','W4','W5','W6','W7'];
  const heatRows = routes.map(r => {
    const cells = weeks.map(() => {
      const v = Math.random();
      const bg = v > 0.6 ? `rgba(239,68,68,${0.3+v*0.5})` : v > 0.3 ? `rgba(245,158,11,${0.3+v*0.4})` : `rgba(0,229,160,${0.2+v*0.4})`;
      return `<div style="height:28px;border-radius:4px;background:${bg};display:flex;align-items:center;justify-content:center;font-size:9px;font-family:monospace;color:rgba(255,255,255,.8)">${Math.round(v*100)}%</div>`;
    }).join('');
    return `<div style="display:grid;grid-template-columns:60px repeat(7,1fr);gap:4px;margin-bottom:4px">
      <div style="font-size:10px;color:var(--text2);display:flex;align-items:center">${r}</div>${cells}</div>`;
  }).join('');

  root.innerHTML = `
    <div class="grid-4">
      <div class="card"><div class="metric-label">In Transit</div><div class="metric-val">247</div></div>
      <div class="card"><div class="metric-label">Delayed</div><div class="metric-val text-red">31</div></div>
      <div class="card"><div class="metric-label">On Time</div><div class="metric-val text-green">198</div></div>
      <div class="card"><div class="metric-label">Avg Delay</div><div class="metric-val text-yellow">2.4d</div></div>
    </div>
    <div class="card mb-16">
      <div class="sec-head"><div class="sec-title">Route Risk Heatmap</div><div class="sec-sub">Color intensity = delay probability</div></div>
      <div style="display:grid;grid-template-columns:60px repeat(7,1fr);gap:4px;margin-bottom:6px">
        <div></div>${weeks.map(w=>`<div style="text-align:center;font-size:10px;color:var(--text2)">${w}</div>`).join('')}
      </div>
      ${heatRows}
    </div>
    <div class="card">
      <div class="sec-head">
        <div class="sec-title">All Shipments</div>
        <input type="text" id="ship-search" placeholder="Search ID or route..." onkeyup="filterShipments()" style="width:200px;padding:6px 10px;font-size:12px">
      </div>
      <table>
        <thead><tr><th>ID</th><th>Origin</th><th>Destination</th><th>Carrier</th><th>ETA</th><th>Delay Risk</th><th>Status</th></tr></thead>
        <tbody id="ship-table">
          ${DEMO.shipments.map(s => `
          <tr data-search="${s.shipment_id.toLowerCase()} ${s.origin.toLowerCase()} ${s.destination.toLowerCase()}">
            <td class="mono" style="font-size:11px">${s.shipment_id}</td>
            <td>${s.origin}</td><td>${s.destination}</td><td>${s.carrier}</td><td>${s.eta}</td>
            <td><div class="bar-wrap" style="width:80px"><div class="bar-fill" style="width:${s.delay_risk_pct}%;background:${barColor(s.delay_risk_pct)}"></div></div></td>
            <td><span class="${statusClass(s.status)}">${s.status.replace('_',' ')}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

function filterShipments() {
  const q = document.getElementById('ship-search').value.toLowerCase();
  document.querySelectorAll('#ship-table tr').forEach(tr => {
    tr.style.display = (tr.dataset.search || '').includes(q) ? '' : 'none';
  });
}

// ── ANALYTICS PAGE ─────────────────────────────────────────────────────────────
function renderAnalytics(root) {
  root.innerHTML = `
    <div class="card mb-16">
      <div class="sec-head"><div class="sec-title">Monthly Delay Trend & Forecast</div><span class="tag tag-green">ML Forecast — XGBoost</span></div>
      <div style="position:relative;height:220px"><canvas id="analyticsChart"></canvas></div>
    </div>
    <div class="grid-2">
      <div class="card">
        <div class="sec-head"><div class="sec-title">Cost Impact by Category</div></div>
        <div style="position:relative;height:200px"><canvas id="costChart"></canvas></div>
      </div>
      <div class="card">
        <div class="sec-head"><div class="sec-title">Model Performance Metrics</div></div>
        ${[
          ['XGBoost Accuracy','91.4%','var(--green)'],
          ['Precision','88.7%','var(--blue)'],
          ['Recall','85.2%','var(--yellow)'],
          ['F1 Score','86.9%','var(--accent)'],
        ].map(([l,v,c]) => `
        <div style="display:flex;justify-content:space-between;margin-bottom:12px">
          <div style="font-size:12px;color:var(--text2)">${l}</div>
          <div style="font-size:20px;font-weight:700;font-family:'Syne',sans-serif;color:${c}">${v}</div>
        </div>`).join('')}
        <hr style="border:none;border-top:1px solid var(--border);margin:12px 0">
        ${[
          ['Shipment Delay Model','91%','var(--green)'],
          ['Inventory Forecast Model','87%','var(--blue)'],
          ['Supplier Risk Model','84%','var(--yellow)'],
        ].map(([l,w,c]) => `
        <div class="mb-8">
          <div class="d-flex justify-between mb-4" style="font-size:11px"><span>${l}</span><span class="mono" style="color:${c}">${w}</span></div>
          <div class="bar-wrap"><div class="bar-fill" style="width:${w};background:${c}"></div></div>
        </div>`).join('')}
      </div>
    </div>`;
  destroyChart('analyticsChart'); makeAnalyticsChart('analyticsChart');
  destroyChart('costChart');      makeCostChart('costChart');
}

// ── RECOMMENDATIONS PAGE ───────────────────────────────────────────────────────
function renderRecommendations(root) {
  root.innerHTML = `
    <div class="grid-3 mb-16">
      <div class="card"><div class="metric-label">Open Actions</div><div class="metric-val text-yellow">11</div></div>
      <div class="card"><div class="metric-label">Completed</div><div class="metric-val text-green">34</div></div>
      <div class="card"><div class="metric-label">Risk Reduced</div><div class="metric-val text-blue">18%</div></div>
    </div>
    <div class="grid-2">
      <div>
        <div class="sec-head mb-12"><div class="sec-title">Critical Recommendations</div><span class="tag tag-red">Urgent</span></div>
        <div class="rec-card">
          <div class="rec-icon" style="background:rgba(239,68,68,.15)">🚨</div>
          <div><div class="rec-title">Expedite SKU-8821 reorder immediately</div>
          <div class="rec-desc">Current stock will deplete in 3 days. Activate emergency supplier FastShip LLC. Estimated cost: $14,200</div>
          <div class="rec-actions"><button class="btn btn-sm btn-primary" onclick="alert('Reorder PO-4821 created!')">Take Action</button><button class="btn btn-sm btn-outline">Dismiss</button></div></div>
        </div>
        <div class="rec-card">
          <div class="rec-icon" style="background:rgba(239,68,68,.15)">⚡</div>
          <div><div class="rec-title">Reroute SH-2041 via Pacific North route</div>
          <div class="rec-desc">Current route has 87% delay probability. Alternative reduces delay risk to 23%. Extra cost: $2,800</div>
          <div class="rec-actions"><button class="btn btn-sm btn-primary" onclick="alert('Reroute approved! Updated ETA: May 5')">Approve Reroute</button><button class="btn btn-sm btn-outline">Review</button></div></div>
        </div>
        <div class="rec-card">
          <div class="rec-icon" style="background:rgba(245,158,11,.15)">⚠</div>
          <div><div class="rec-title">Qualify backup supplier for TechParts-IN</div>
          <div class="rec-desc">Reliability dropped to 61%. Recommend onboarding EuroPrecision as secondary source for critical components.</div>
          <div class="rec-actions"><button class="btn btn-sm btn-outline" onclick="alert('Supplier qualification process started!')">Start Process</button></div></div>
        </div>
      </div>
      <div>
        <div class="sec-head mb-12"><div class="sec-title">Optimization Suggestions</div><span class="tag tag-blue">AI Insights</span></div>
        <div class="rec-card">
          <div class="rec-icon" style="background:rgba(0,229,160,.15)">📦</div>
          <div><div class="rec-title">Increase safety stock for Q2 demand spike</div>
          <div class="rec-desc">ML model forecasts 32% demand increase in next 6 weeks. Recommend raising safety stock buffer from 15% to 25%.</div></div>
        </div>
        <div class="rec-card">
          <div class="rec-icon" style="background:rgba(59,130,246,.15)">🔄</div>
          <div><div class="rec-title">Consolidate shipments on Hamburg→Asia route</div>
          <div class="rec-desc">3 separate shipments in next 2 weeks can be consolidated. Estimated savings: $8,400 in freight costs.</div></div>
        </div>
        <div class="rec-card">
          <div class="rec-icon" style="background:rgba(245,158,11,.15)">📊</div>
          <div><div class="rec-title">Enable real-time API for Port of Shanghai</div>
          <div class="rec-desc">Integration would improve delay prediction accuracy by estimated 7.3% for Asia-Pacific routes.</div></div>
        </div>
        <div class="rec-card">
          <div class="rec-icon" style="background:rgba(0,229,160,.15)">✅</div>
          <div><div class="rec-title">EuroPrecision contract renewal — favorable</div>
          <div class="rec-desc">Supplier maintains 96% on-time rate. Recommend long-term contract to lock in pricing before Q3.</div></div>
        </div>
      </div>
    </div>`;
}

// ── UPLOAD PAGE ────────────────────────────────────────────────────────────────
function renderUpload(root) {
  root.innerHTML = `
    <div class="grid-2">
      <div>
        <div class="sec-title mb-16">Upload Supply Chain Dataset</div>
        <div class="upload-zone" onclick="simulateUpload('shipments')">
          <div class="upload-zone-icon">📦</div>
          <div class="upload-zone-title">Shipment Data (CSV / Excel)</div>
          <div class="upload-zone-sub">Orders, routes, carriers, ETAs, weights</div>
        </div>
        <div class="upload-zone" onclick="simulateUpload('inventory')">
          <div class="upload-zone-icon">🗄️</div>
          <div class="upload-zone-title">Inventory Records (CSV / Excel)</div>
          <div class="upload-zone-sub">SKU, stock levels, demand history</div>
        </div>
        <div class="upload-zone" onclick="simulateUpload('suppliers')">
          <div class="upload-zone-icon">🏭</div>
          <div class="upload-zone-title">Supplier Performance (CSV / Excel)</div>
          <div class="upload-zone-sub">Delivery history, quality scores</div>
        </div>
        <div class="alert alert-blue mt-12" style="margin-top:12px">
          <span class="alert-icon" style="color:var(--blue)">ℹ</span>
          <div><strong>Backend API endpoint</strong><span>POST /api/predict/batch-upload — accepts CSV/Excel with columns: origin, destination, carrier, cargo_type, weight_kg</span></div>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="sec-title mb-16">Data Processing Pipeline</div>
          <div id="pipeline-steps">
            ${[
              ['Data Collection',    'Import CSV/Excel or connect live API data sources',        'var(--green)','dot-collect'],
              ['Data Preprocessing', 'Handle missing values, normalize, encode categoricals',    'var(--green)','dot-preproc'],
              ['ML Model Inference', 'XGBoost + Scikit-learn prediction pipeline runs',          'var(--border2)','dot-ml'],
              ['Risk Scoring',       'Calculate composite risk scores and generate alerts',      'var(--border2)','dot-risk'],
              ['Dashboard Update',   'Visualize insights and generate recommendations',          'var(--border2)','dot-dash'],
            ].map(([title, sub, color, dotId], i, arr) => `
            <div class="timeline-item">
              <div class="tl-left">
                <div class="tl-dot" id="${dotId}" style="background:${color}"></div>
                ${i < arr.length-1 ? '<div class="tl-line"></div>' : ''}
              </div>
              <div class="tl-content">
                <div class="tl-title">${title}</div>
                <div class="tl-sub">${sub}</div>
              </div>
            </div>`).join('')}
          </div>
          <div class="upload-log" id="upload-log">> System ready. Click a dataset above to simulate the processing pipeline.</div>
        </div>
      </div>
    </div>`;
}

function simulateUpload(type) {
  const log  = document.getElementById('upload-log');
  const dots = ['dot-ml','dot-risk','dot-dash'];
  const info = { shipments:['shipment_data.csv','247 shipment records'], inventory:['inventory.xlsx','1,842 SKU records'], suppliers:['supplier_performance.csv','84 supplier records'] };
  const [file, records] = info[type];
  dots.forEach(id => { const d=document.getElementById(id); if(d) d.style.background='var(--border2)'; });
  log.textContent = `> Loading ${file}...`;
  const steps = [
    [400,  `> Parsing ${records}...`],
    [800,  `> Checking for missing values...`],
    [1200, `> Encoding categorical variables...`],
    [1600, `> Feature engineering complete ✓`],
    [2000, `> Running XGBoost inference pipeline...`],
    [2400, `> Calculating composite risk scores...`],
    [2800, `> Generating alerts and recommendations...`],
    [3200, `> Updating dashboard metrics...`],
    [3600, `> ✅ Pipeline complete! ${records} processed successfully.`],
  ];
  let dotIdx = 0;
  steps.forEach(([t, msg], i) => {
    setTimeout(() => {
      log.textContent += '\n' + msg;
      log.scrollTop = log.scrollHeight;
      if (i >= 3 && dotIdx < dots.length) {
        const d = document.getElementById(dots[dotIdx]);
        if (d) d.style.background = 'var(--green)';
        dotIdx++;
      }
    }, t);
  });
}
