"""
Shipments Routes - CRUD + Risk Assessment
"""

from fastapi import APIRouter, HTTPException, Query
from models.schemas import ShipmentCreate, ShipmentResponse, RiskLevel, ShipmentStatus
from services.ml_service import get_delay_model
from datetime import datetime
import uuid
import random

router = APIRouter()

# In-memory store (replace with MongoDB in production)
SHIPMENTS_DB = [
    {"shipment_id": "SH-2041", "origin": "Mumbai", "destination": "Los Angeles", "carrier": "Maersk", "cargo_type": "Electronics", "weight_kg": 18000, "departure_date": "2026-04-20", "eta": "2026-05-03", "status": "DELAYED", "delay_risk_pct": 87.0, "risk_level": "HIGH", "created_at": "2026-04-20"},
    {"shipment_id": "SH-2040", "origin": "Shanghai", "destination": "Rotterdam", "carrier": "COSCO", "cargo_type": "Textiles", "weight_kg": 22000, "departure_date": "2026-04-22", "eta": "2026-05-06", "status": "AT_RISK", "delay_risk_pct": 55.0, "risk_level": "MEDIUM", "created_at": "2026-04-22"},
    {"shipment_id": "SH-2039", "origin": "Shanghai", "destination": "New York", "carrier": "MSC", "cargo_type": "Industrial Parts", "weight_kg": 15000, "departure_date": "2026-04-18", "eta": "2026-04-30", "status": "AT_RISK", "delay_risk_pct": 42.0, "risk_level": "MEDIUM", "created_at": "2026-04-18"},
    {"shipment_id": "SH-2038", "origin": "Hamburg", "destination": "Dubai", "carrier": "Hapag-Lloyd", "cargo_type": "Chemicals", "weight_kg": 8000, "departure_date": "2026-04-25", "eta": "2026-05-15", "status": "ON_TIME", "delay_risk_pct": 18.0, "risk_level": "LOW", "created_at": "2026-04-25"},
    {"shipment_id": "SH-2037", "origin": "Berlin", "destination": "Tokyo", "carrier": "CMA CGM", "cargo_type": "Electronics", "weight_kg": 11000, "departure_date": "2026-04-24", "eta": "2026-05-08", "status": "ON_TIME", "delay_risk_pct": 12.0, "risk_level": "LOW", "created_at": "2026-04-24"},
    {"shipment_id": "SH-2036", "origin": "Dubai", "destination": "Singapore", "carrier": "Maersk", "cargo_type": "Textiles", "weight_kg": 6500, "departure_date": "2026-04-23", "eta": "2026-04-29", "status": "ON_TIME", "delay_risk_pct": 25.0, "risk_level": "LOW", "created_at": "2026-04-23"},
    {"shipment_id": "SH-2035", "origin": "Dubai", "destination": "New York", "carrier": "MSC", "cargo_type": "Industrial Parts", "weight_kg": 19000, "departure_date": "2026-04-21", "eta": "2026-05-01", "status": "AT_RISK", "delay_risk_pct": 63.0, "risk_level": "HIGH", "created_at": "2026-04-21"},
]


@router.get("/")
async def get_shipments(
    status: str = Query(None, description="Filter by status"),
    risk_level: str = Query(None, description="Filter by risk level"),
    limit: int = Query(50, le=200),
    skip: int = Query(0, ge=0),
):
    """Get all shipments with optional filtering"""
    data = SHIPMENTS_DB.copy()
    if status:
        data = [s for s in data if s["status"] == status.upper()]
    if risk_level:
        data = [s for s in data if s["risk_level"] == risk_level.upper()]
    return {"total": len(data), "shipments": data[skip:skip + limit]}


@router.get("/summary")
async def get_shipment_summary():
    """Get shipment summary KPIs"""
    total = len(SHIPMENTS_DB)
    delayed = sum(1 for s in SHIPMENTS_DB if s["status"] == "DELAYED")
    at_risk = sum(1 for s in SHIPMENTS_DB if s["status"] == "AT_RISK")
    on_time = sum(1 for s in SHIPMENTS_DB if s["status"] == "ON_TIME")
    avg_risk = round(sum(s["delay_risk_pct"] for s in SHIPMENTS_DB) / total, 1)
    return {
        "total_shipments": total,
        "delayed": delayed,
        "at_risk": at_risk,
        "on_time": on_time,
        "avg_delay_risk_pct": avg_risk,
    }


@router.get("/{shipment_id}")
async def get_shipment(shipment_id: str):
    """Get a specific shipment by ID"""
    shipment = next((s for s in SHIPMENTS_DB if s["shipment_id"] == shipment_id), None)
    if not shipment:
        raise HTTPException(status_code=404, detail=f"Shipment {shipment_id} not found")
    return shipment


@router.post("/", status_code=201)
async def create_shipment(shipment: ShipmentCreate):
    """Create a new shipment and predict its risk"""
    model = get_delay_model()
    prediction = model.predict(
        origin=shipment.origin,
        destination=shipment.destination,
        carrier=shipment.carrier,
        cargo_type=shipment.cargo_type,
        weight_kg=shipment.weight_kg,
        departure_date=shipment.departure_date,
    )
    new_shipment = {
        "shipment_id": f"SH-{random.randint(2000, 9999)}",
        "origin": shipment.origin,
        "destination": shipment.destination,
        "carrier": shipment.carrier,
        "cargo_type": shipment.cargo_type,
        "weight_kg": shipment.weight_kg,
        "departure_date": shipment.departure_date.isoformat(),
        "eta": shipment.eta.isoformat(),
        "status": "DELAYED" if prediction["delay_probability"] >= 60 else "AT_RISK" if prediction["delay_probability"] >= 30 else "ON_TIME",
        "delay_risk_pct": prediction["delay_probability"],
        "risk_level": prediction["risk_level"],
        "created_at": datetime.now().isoformat(),
    }
    SHIPMENTS_DB.append(new_shipment)
    return new_shipment


@router.delete("/{shipment_id}")
async def delete_shipment(shipment_id: str):
    global SHIPMENTS_DB
    before = len(SHIPMENTS_DB)
    SHIPMENTS_DB = [s for s in SHIPMENTS_DB if s["shipment_id"] != shipment_id]
    if len(SHIPMENTS_DB) == before:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return {"message": f"Shipment {shipment_id} deleted"}
