"""
Suppliers Routes - Supplier Performance & Risk Scoring
"""

from fastapi import APIRouter, HTTPException
from models.schemas import SupplierCreate
from services.ml_service import get_supplier_model

router = APIRouter()

SUPPLIERS_DB = [
    {"supplier_id": "SUP-001", "name": "GlobalParts Co.", "region": "China", "on_time_rate": 0.91, "quality_score": 88, "defect_rate": 0.015, "avg_lead_time": 12},
    {"supplier_id": "SUP-002", "name": "TechParts-IN", "region": "India", "on_time_rate": 0.61, "quality_score": 72, "defect_rate": 0.04, "avg_lead_time": 18},
    {"supplier_id": "SUP-003", "name": "EuroPrecision", "region": "Germany", "on_time_rate": 0.96, "quality_score": 95, "defect_rate": 0.005, "avg_lead_time": 10},
    {"supplier_id": "SUP-004", "name": "FastShip LLC", "region": "USA", "on_time_rate": 0.78, "quality_score": 81, "defect_rate": 0.025, "avg_lead_time": 7},
    {"supplier_id": "SUP-005", "name": "AsiaTrade Corp", "region": "Vietnam", "on_time_rate": 0.84, "quality_score": 79, "defect_rate": 0.02, "avg_lead_time": 15},
]


def enrich(supplier: dict) -> dict:
    model = get_supplier_model()
    risk = model.calculate_risk_score(supplier["on_time_rate"], supplier["quality_score"], supplier.get("defect_rate", 0.02), supplier.get("avg_lead_time", 14))
    return {**supplier, **risk}


@router.get("/")
async def get_suppliers():
    return {"total": len(SUPPLIERS_DB), "suppliers": [enrich(s) for s in SUPPLIERS_DB]}


@router.get("/summary")
async def get_supplier_summary():
    data = [enrich(s) for s in SUPPLIERS_DB]
    high_risk = sum(1 for s in data if s["risk_level"] == "HIGH")
    avg_score = round(sum(s["risk_score"] for s in data) / len(data), 1)
    return {"total": len(data), "high_risk": high_risk, "avg_risk_score": avg_score}


@router.get("/{supplier_id}")
async def get_supplier(supplier_id: str):
    s = next((s for s in SUPPLIERS_DB if s["supplier_id"] == supplier_id), None)
    if not s:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return enrich(s)


@router.post("/", status_code=201)
async def add_supplier(supplier: SupplierCreate):
    new = supplier.dict()
    SUPPLIERS_DB.append(new)
    return enrich(new)
