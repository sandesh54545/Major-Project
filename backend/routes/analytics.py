"""
Analytics Routes - Trends, KPIs, and Forecasts
"""

from fastapi import APIRouter
from datetime import datetime, timedelta
import random

router = APIRouter()


@router.get("/dashboard-kpis")
async def get_dashboard_kpis():
    return {
        "active_shipments": 247,
        "delayed_shipments": 31,
        "inventory_risk_pct": 34,
        "avg_supplier_score": 78.4,
        "avg_delay_risk_pct": 22,
        "cost_savings_potential": 284000,
    }


@router.get("/delay-trend")
async def get_delay_trend(months: int = 6):
    labels = []
    values = []
    base = datetime.now()
    for i in range(months, 0, -1):
        d = base - timedelta(days=i * 30)
        labels.append(d.strftime("%b %Y"))
        values.append(random.randint(22, 45))
    return {"labels": labels, "actual": values, "forecast": [random.randint(18, 35) for _ in range(3)]}


@router.get("/cost-impact")
async def get_cost_impact():
    return {
        "quarters": ["Q1 2026", "Q2 2026*", "Q3 2026*"],
        "delay_costs": [142000, 128000, 110000],
        "stockout_losses": [87000, 76000, 62000],
        "supplier_issues": [54000, 44000, 38000],
    }


@router.get("/risk-heatmap")
async def get_risk_heatmap():
    routes = ["US-CN", "US-EU", "US-IN", "EU-CN", "EU-IN", "AS-US", "ME-EU"]
    weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7"]
    data = {route: {week: round(random.uniform(0.05, 0.95), 2) for week in weeks} for route in routes}
    return {"routes": routes, "weeks": weeks, "data": data}


@router.get("/forecast-demand")
async def get_demand_forecast(sku_id: str = "SKU-8821", days: int = 30):
    base_demand = 85
    forecast = [max(0, int(base_demand + random.gauss(0, 10))) for _ in range(days)]
    return {"sku_id": sku_id, "forecast_days": days, "forecast": forecast, "avg": round(sum(forecast) / len(forecast), 1)}
