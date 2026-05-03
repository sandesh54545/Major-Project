/**
 * App.js - Main application entry point
 * Handles page routing, live clock, and global utilities
 */

const PAGE_TITLES = {
  dashboard: 'Dashboard Overview',
  predict:   'Risk Prediction Engine',
  inventory: 'Inventory Risk Monitor',
  suppliers: 'Supplier Scorecard',
  shipments: 'Shipment Tracker',
  analytics: 'Analytics & Forecasting',
  recommendations: 'AI Recommendations',
  upload:    'Data Upload & Processing'
};

const PAGE_RENDERERS = {
  dashboard:       renderDashboard,
  predict:         renderPredict,
  inventory:       renderInventory,
  suppliers:       renderSuppliers,
  shipments:       renderShipments,
  analytics:       renderAnalytics,
  recommendations: renderRecommendations,
  upload:          renderUpload,
};

let currentPage = 'dashboard';

function gotoPage(id, btn) {
  currentPage = id;
  document.getElementById('page-title').textContent = PAGE_TITLES[id] || id;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const root = document.getElementById('page-root');
  root.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';
  setTimeout(() => {
    if (PAGE_RENDERERS[id]) PAGE_RENDERERS[id](root);
  }, 80);
}

function refreshData() {
  const btn = document.querySelector('.topbar-right .btn-outline');
  if (btn) { btn.textContent = '↻ Refreshing...'; }
  setTimeout(() => {
    if (btn) btn.textContent = '↻ Refresh';
    gotoPage(currentPage, document.querySelector('.nav-item.active'));
  }, 800);
}

// Live clock
function updateClock() {
  const el = document.getElementById('live-time');
  if (el) el.textContent = new Date().toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// Boot
window.addEventListener('DOMContentLoaded', () => {
  gotoPage('dashboard', document.querySelector('.nav-item.active'));
});

// Helpers
function riskClass(level) {
  const m = { HIGH:'risk-high', CRITICAL:'risk-critical', MEDIUM:'risk-med', LOW:'risk-low' };
  return 'risk ' + (m[level] || 'risk-low');
}

function statusClass(status) {
  const m = { DELAYED:'risk-high', AT_RISK:'risk-med', ON_TIME:'risk-low', DELIVERED:'risk-low' };
  return 'risk ' + (m[status] || 'risk-low');
}

function barColor(pct) {
  if (pct >= 60) return 'var(--red)';
  if (pct >= 30) return 'var(--yellow)';
  return 'var(--green)';
}

function reorder(skuId) {
  const po = 'PO-' + Math.floor(Math.random() * 9000 + 1000);
  alert(`✅ Reorder request created!\n\nPurchase Order: ${po}\nSKU: ${skuId}\nStatus: Pending Approval\n\nCheck the Inventory page for details.`);
}
