function renderDashboard(root) {
  root.innerHTML = `
    <div class="grid-4">
      <div class="card"><div class="metric-label">Active Shipments</div><div class="metric-val text-blue">247</div><div class="metric-change change-bad">↑ 12 delayed</div></div>
      <div class="card"><div class="metric-label">Inventory Risk</div><div class="metric-val text-yellow">34%</div><div class="metric-change change-bad">↑ 6% from last week</div></div>
      <div class="card"><div class="metric-label">Supplier Score</div><div class="metric-val text-green">78.4</div><div class="metric-change change-good">↑ improved +2.1</div></div>
      <div class="card"><div class="metric-label">Avg Delay Risk</div><div class="metric-val text-red">22%</div><div class="metric-change text-muted">across all routes</div></div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="sec-head"><div><div class="sec-title">Shipment Delay Forecast</div><div class="sec-sub">Next 14 days — XGBoost prediction</div></div></div>
        <div style="position:relative;height:180px"><canvas id="delayChart"></canvas></div>
      </div>
      <div class="card">
        <div class="sec-head"><div><div class="sec-title">Risk Distribution</div><div class="sec-sub">By category</div></div></div>
        <div style="display:flex;gap:16px;align-items:center">
          <div style="position:relative;height:160px;width:160px;flex-shrink:0"><canvas id="riskPie"></canvas></div>
          <div style="flex:1">
            ${[['Shipment Delays','38%','var(--red)'],['Inventory Shortage','29%','var(--yellow)'],['Supplier Issues','22%','var(--blue)'],['Other','11%','var(--green)']].map(([l,v,c]) => `
            <div class="mb-8">
              <div class="d-flex justify-between mb-4" style="font-size:11px"><span>${l}</span><span class="mono" style="color:${c}">${v}</span></div>
              <div class="bar-wrap"><div class="bar-fill" style="width:${v};background:${c}"></div></div>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="sec-head"><div class="sec-title">Active Alerts</div><span class="tag tag-red">3 critical</span></div>
        <div class="alert alert-red"><span class="alert-icon" style="color:var(--red)">⚠</span><div><strong>Route US-CN-047 — 87% delay probability</strong><span>Predicted 4.2 day delay — typhoon season impact detected</span></div></div>
        <div class="alert alert-red"><span class="alert-icon" style="color:var(--red)">⚠</span><div><strong>SKU-8821 inventory critical — 3 days to stockout</strong><span>Demand spike detected, reorder recommended immediately</span></div></div>
        <div class="alert alert-yellow"><span class="alert-icon" style="color:var(--yellow)">◎</span><div><strong>Supplier TechParts-IN reliability dropped to 61%</strong><span>3 consecutive late deliveries — consider backup sourcing</span></div></div>
      </div>
      <div class="card">
        <div class="sec-head"><div class="sec-title">Recent Shipments</div></div>
        <table>
          <thead><tr><th>ID</th><th>Route</th><th>ETA</th><th>Risk</th></tr></thead>
          <tbody>
            ${DEMO.shipments.slice(0,5).map(s => `
            <tr>
              <td class="mono" style="font-size:11px">${s.shipment_id}</td>
              <td>${s.origin} → ${s.destination}</td>
              <td>${s.eta}</td>
              <td><span class="${riskClass(s.risk_level)}">${s.risk_level}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;

  destroyChart('delayChart'); makeDelayChart('delayChart');
  destroyChart('riskPie');    makeRiskPie('riskPie');
}
