/**
 * API Service - Communicates with FastAPI Backend
 * Base URL: http://localhost:8000
 */

const API_BASE = 'http://localhost:8000/api';

const API = {
  async get(path) {
    try {
      const res = await fetch(API_BASE + path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('API GET failed, using demo data:', path, e.message);
      return null;
    }
  },
  async post(path, body) {
    try {
      const res = await fetch(API_BASE + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('API POST failed, using local simulation:', path, e.message);
      return null;
    }
  }
};

// Demo/fallback data when backend is not running
const DEMO = {
  shipments: [
    { shipment_id:'SH-2041', origin:'Mumbai', destination:'Los Angeles', carrier:'Maersk', cargo_type:'Electronics', weight_kg:18000, eta:'2026-05-03', status:'DELAYED', delay_risk_pct:87, risk_level:'HIGH' },
    { shipment_id:'SH-2040', origin:'Shanghai', destination:'Rotterdam', carrier:'COSCO', cargo_type:'Textiles', weight_kg:22000, eta:'2026-05-06', status:'AT_RISK', delay_risk_pct:55, risk_level:'MEDIUM' },
    { shipment_id:'SH-2039', origin:'Shanghai', destination:'New York', carrier:'MSC', cargo_type:'Industrial Parts', weight_kg:15000, eta:'2026-04-30', status:'AT_RISK', delay_risk_pct:42, risk_level:'MEDIUM' },
    { shipment_id:'SH-2038', origin:'Hamburg', destination:'Dubai', carrier:'Hapag-Lloyd', cargo_type:'Chemicals', weight_kg:8000, eta:'2026-05-15', status:'ON_TIME', delay_risk_pct:18, risk_level:'LOW' },
    { shipment_id:'SH-2037', origin:'Berlin', destination:'Tokyo', carrier:'CMA CGM', cargo_type:'Electronics', weight_kg:11000, eta:'2026-05-08', status:'ON_TIME', delay_risk_pct:12, risk_level:'LOW' },
    { shipment_id:'SH-2036', origin:'Dubai', destination:'Singapore', carrier:'Maersk', cargo_type:'Textiles', weight_kg:6500, eta:'2026-04-29', status:'ON_TIME', delay_risk_pct:25, risk_level:'LOW' },
    { shipment_id:'SH-2035', origin:'Dubai', destination:'New York', carrier:'MSC', cargo_type:'Industrial Parts', weight_kg:19000, eta:'2026-05-01', status:'AT_RISK', delay_risk_pct:63, risk_level:'HIGH' },
  ],
  inventory: [
    { sku_id:'SKU-8821', product_name:'IC Chips A100', current_stock:255, avg_daily_demand:85, lead_time_days:7, unit_cost:48.50, days_to_stockout:3, risk_level:'CRITICAL', recommended_reorder_qty:2550, safety_stock:893 },
    { sku_id:'SKU-4402', product_name:'Power Supply Unit', current_stock:820, avg_daily_demand:62, lead_time_days:5, unit_cost:32.00, days_to_stockout:13, risk_level:'HIGH', recommended_reorder_qty:1860, safety_stock:465 },
    { sku_id:'SKU-7731', product_name:'Sensor Module', current_stock:1240, avg_daily_demand:45, lead_time_days:10, unit_cost:19.75, days_to_stockout:27, risk_level:'MEDIUM', recommended_reorder_qty:1350, safety_stock:675 },
    { sku_id:'SKU-3310', product_name:'HDMI Cables', current_stock:4800, avg_daily_demand:120, lead_time_days:3, unit_cost:8.20, days_to_stockout:40, risk_level:'LOW', recommended_reorder_qty:3600, safety_stock:540 },
    { sku_id:'SKU-9901', product_name:'Motor Drive PCB', current_stock:380, avg_daily_demand:55, lead_time_days:14, unit_cost:67.30, days_to_stockout:7, risk_level:'HIGH', recommended_reorder_qty:1650, safety_stock:1155 },
    { sku_id:'SKU-1122', product_name:'Ethernet Switch', current_stock:650, avg_daily_demand:30, lead_time_days:7, unit_cost:42.00, days_to_stockout:21, risk_level:'MEDIUM', recommended_reorder_qty:900, safety_stock:315 },
  ],
  suppliers: [
    { supplier_id:'SUP-001', name:'GlobalParts Co.', region:'China', on_time_rate:0.91, quality_score:88, risk_score:82, risk_level:'LOW' },
    { supplier_id:'SUP-002', name:'TechParts-IN', region:'India', on_time_rate:0.61, quality_score:72, risk_score:41, risk_level:'HIGH' },
    { supplier_id:'SUP-003', name:'EuroPrecision', region:'Germany', on_time_rate:0.96, quality_score:95, risk_score:94, risk_level:'LOW' },
    { supplier_id:'SUP-004', name:'FastShip LLC', region:'USA', on_time_rate:0.78, quality_score:81, risk_score:67, risk_level:'MEDIUM' },
    { supplier_id:'SUP-005', name:'AsiaTrade Corp', region:'Vietnam', on_time_rate:0.84, quality_score:79, risk_score:71, risk_level:'MEDIUM' },
  ]
};
