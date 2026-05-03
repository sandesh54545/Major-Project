"""
Inventory Routes - Stock Management & Risk
"""

from fastapi import APIRouter, HTTPException, Query
from models.schemas import InventoryItem, RiskLevel
from services.ml_service import get_inventory_model

router = APIRouter()

INVENTORY_DB = [
    {"sku_id": "SKU-8821", "product_name": "IC Chips A100", "current_stock": 255, "avg_daily_demand": 85, "lead_time_days": 7, "unit_cost": 48.50},
    {"sku_id": "SKU-4402", "product_name": "Power Supply Unit", "current_stock": 820, "avg_daily_demand": 62, "lead_time_days": 5, "unit_cost": 32.00},
    {"sku_id": "SKU-7731", "product_name": "Sensor Module", "current_stock": 1240, "avg_daily_demand": 45, "lead_time_days": 10, "unit_cost": 19.75},
    {"sku_id": "SKU-3310", "product_name": "HDMI Cables", "current_stock": 4800, "avg_daily_demand": 120, "lead_time_days": 3, "unit_cost": 8.20},
    {"sku_id": "SKU-9901", "product_name": "Motor Drive PCB", "current_stock": 380, "avg_daily_demand": 55, "lead_time_days": 14, "unit_cost": 67.30},
    {"sku_id": "SKU-1122", "product_name": "Ethernet Switch", "current_stock": 650, "avg_daily_demand": 30, "lead_time_days": 7, "unit_cost": 42.00},
]


def enrich_with_risk(item: dict) -> dict:
    model = get_inventory_model()
    risk = model.predict_stockout(item["current_stock"], item["avg_daily_demand"], item.get("lead_time_days", 7))
    return {**item, **risk}


@router.get("/")
async def get_inventory(
    risk_level: str = Query(None),
    limit: int = Query(50),
    skip: int = Query(0),
):
    data = [enrich_with_risk(i) for i in INVENTORY_DB]
    if risk_level:
        data = [i for i in data if i["risk_level"] == risk_level.upper()]
    return {"total": len(data), "items": data[skip:skip + limit]}


@router.get("/summary")
async def get_inventory_summary():
    data = [enrich_with_risk(i) for i in INVENTORY_DB]
    critical = sum(1 for i in data if i["risk_level"] == "CRITICAL")
    high = sum(1 for i in data if i["risk_level"] == "HIGH")
    medium = sum(1 for i in data if i["risk_level"] == "MEDIUM")
    low = sum(1 for i in data if i["risk_level"] == "LOW")
    return {"total_skus": len(data), "critical": critical, "high": high, "medium": medium, "low": low}


@router.get("/{sku_id}")
async def get_inventory_item(sku_id: str):
    item = next((i for i in INVENTORY_DB if i["sku_id"] == sku_id), None)
    if not item:
        raise HTTPException(status_code=404, detail=f"SKU {sku_id} not found")
    return enrich_with_risk(item)


@router.post("/", status_code=201)
async def add_inventory_item(item: InventoryItem):
    if any(i["sku_id"] == item.sku_id for i in INVENTORY_DB):
        raise HTTPException(status_code=400, detail=f"SKU {item.sku_id} already exists")
    new_item = item.dict()
    INVENTORY_DB.append(new_item)
    return enrich_with_risk(new_item)


@router.post("/{sku_id}/reorder")
async def create_reorder(sku_id: str):
    item = next((i for i in INVENTORY_DB if i["sku_id"] == sku_id), None)
    if not item:
        raise HTTPException(status_code=404, detail=f"SKU {sku_id} not found")
    model = get_inventory_model()
    risk = model.predict_stockout(item["current_stock"], item["avg_daily_demand"], item.get("lead_time_days", 7))
    import random
    return {
        "purchase_order_id": f"PO-{random.randint(1000,9999)}",
        "sku_id": sku_id,
        "product_name": item["product_name"],
        "reorder_qty": risk["recommended_reorder_qty"],
        "estimated_cost": round(risk["recommended_reorder_qty"] * item.get("unit_cost", 10), 2),
        "status": "PENDING_APPROVAL",
    }
