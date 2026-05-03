/**
 * Chart Utilities - Chart.js wrappers
 */

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

const GRID_COLOR = '#1e2a42';
const TICK_COLOR = '#8892a4';
const TICK_FONT  = { size: 10, family: "'DM Mono', monospace" };

function axisDefaults(extra = {}) {
  return {
    ticks: { color: TICK_COLOR, font: TICK_FONT },
    grid:  { color: GRID_COLOR },
    ...extra
  };
}

function makeDelayChart(canvasId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  });
  const data = [18,22,31,28,45,52,48,61,55,42,38,29,25,22];
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Delay Probability %',
        data,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,.12)',
        fill: true, tension: .4, pointRadius: 3,
        pointBackgroundColor: '#ef4444'
      }]
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        x: axisDefaults({ grid: { color: GRID_COLOR } }),
        y: axisDefaults({ min: 0, max: 80, ticks: { color: TICK_COLOR, font: TICK_FONT, callback: v => v + '%' } })
      }
    }
  });
}

function makeRiskPie(canvasId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Shipment', 'Inventory', 'Supplier', 'Other'],
      datasets: [{
        data: [38, 29, 22, 11],
        backgroundColor: ['#ef4444','#f59e0b','#3b82f6','#00e5a0'],
        borderWidth: 0, hoverOffset: 6
      }]
    },
    options: { ...CHART_DEFAULTS, cutout: '65%' }
  });
}

function makeInventoryChart(canvasId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  const labels = Array.from({ length: 30 }, (_, i) => 'D+' + (i + 1));
  const stock  = Array.from({ length: 30 }, (_, i) => Math.max(0, 4500 - i * 85));
  const demand = Array.from({ length: 30 }, () => Math.round(85 + (Math.random() - .5) * 30));
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Stock Level', data: stock, backgroundColor: 'rgba(59,130,246,.3)', borderColor: '#3b82f6', borderWidth: 1, yAxisID: 'y' },
        { label: 'Daily Demand', data: demand, type: 'line', borderColor: '#f59e0b', backgroundColor: 'transparent', tension: .4, yAxisID: 'y1', pointRadius: 0 }
      ]
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        x: { ticks: { color: TICK_COLOR, font: TICK_FONT, maxTicksLimit: 10 }, grid: { display: false } },
        y: axisDefaults(),
        y1: { position: 'right', ticks: { color: '#f59e0b', font: TICK_FONT }, grid: { display: false } }
      }
    }
  });
}

function makeSupplierBarChart(canvasId, suppliers) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  const colors = suppliers.map(s => s.risk_level === 'LOW' ? '#00e5a0' : s.risk_level === 'HIGH' ? '#ef4444' : '#f59e0b');
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: suppliers.map(s => s.name.split(' ')[0]),
      datasets: [{ label: 'Risk Score', data: suppliers.map(s => s.risk_score), backgroundColor: colors }]
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        x: { ticks: { color: TICK_COLOR, font: TICK_FONT }, grid: { display: false } },
        y: axisDefaults({ min: 0, max: 100 })
      }
    }
  });
}

function makeSupplierTrendChart(canvasId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [
        { label: 'Avg Score', data: [71,69,72,75,76,78], borderColor: '#00e5a0', backgroundColor: 'rgba(0,229,160,.1)', fill: true, tension: .4, pointRadius: 4 },
        { label: 'TechParts', data: [74,72,68,63,58,41], borderColor: '#ef4444', backgroundColor: 'transparent', tension: .4, pointRadius: 4, borderDash: [4,4] }
      ]
    },
    options: { ...CHART_DEFAULTS, scales: { x: { ticks: { color: TICK_COLOR, font: TICK_FONT }, grid: { display: false } }, y: axisDefaults({ min: 30, max: 100 }) } }
  });
}

function makeAnalyticsChart(canvasId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Nov','Dec','Jan','Feb','Mar','Apr','May*','Jun*','Jul*'],
      datasets: [
        { label: 'Actual', data: [28,35,41,38,31,29,null,null,null], backgroundColor: 'rgba(59,130,246,.5)', borderColor: '#3b82f6', borderWidth: 1 },
        { label: 'Forecast', data: [null,null,null,null,null,29,33,27,24], backgroundColor: 'rgba(0,229,160,.2)', borderColor: '#00e5a0', borderWidth: 1 }
      ]
    },
    options: { ...CHART_DEFAULTS, scales: { x: { ticks: { color: TICK_COLOR, font: TICK_FONT }, grid: { display: false } }, y: axisDefaults() } }
  });
}

function makeCostChart(canvasId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Q1 2026','Q2 2026*','Q3 2026*'],
      datasets: [
        { label: 'Delay Costs',     data: [142000,128000,110000], backgroundColor: 'rgba(239,68,68,.6)' },
        { label: 'Stockout Losses', data: [87000,76000,62000],   backgroundColor: 'rgba(245,158,11,.6)' },
        { label: 'Supplier Issues', data: [54000,44000,38000],   backgroundColor: 'rgba(59,130,246,.6)' }
      ]
    },
    options: {
      ...CHART_DEFAULTS,
      scales: {
        x: { stacked: true, ticks: { color: TICK_COLOR, font: TICK_FONT }, grid: { display: false } },
        y: { stacked: true, ticks: { color: TICK_COLOR, font: TICK_FONT, callback: v => '$' + Math.round(v/1000) + 'k' }, grid: { color: GRID_COLOR } }
      }
    }
  });
}

// Destroy existing chart on a canvas before redrawing
function destroyChart(canvasId) {
  const existing = Chart.getChart(canvasId);
  if (existing) existing.destroy();
}
