"""
Pydantic Models for Request/Response Validation
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ShipmentStatus(str, Enum):
    ON_TIME = "ON_TIME"
    AT_RISK = "AT_RISK"
    DELAYED = "DELAYED"
    DELIVERED = "DELIVERED"


# ── Shipment Models ──────────────────────────────────────────────────────────

class ShipmentCreate(BaseModel):
    origin: str = Field(..., example="Mumbai")
    destination: str = Field(..., example="Los Angeles")
    carrier: str = Field(..., example="Maersk")
    cargo_type: str = Field(..., example="Electronics")
    weight_kg: float = Field(..., gt=0, example=12500)
    departure_date: datetime
    eta: datetime

class ShipmentResponse(BaseModel):
    shipment_id: str
    origin: str
    destination: str
    carrier: str
    cargo_type: str
    weight_kg: float
    departure_date: datetime
    eta: datetime
    status: ShipmentStatus
    delay_risk_pct: float
    risk_level: RiskLevel
    created_at: datetime


# ── Inventory Models ──────────────────────────────────────────────────────────

class InventoryItem(BaseModel):
    sku_id: str = Field(..., example="SKU-8821")
    product_name: str = Field(..., example="IC Chips A100")
    current_stock: int = Field(..., ge=0)
    avg_daily_demand: float = Field(..., gt=0)
    reorder_point: Optional[int] = None
    lead_time_days: int = Field(default=7, ge=1)
    unit_cost: float = Field(default=0.0, ge=0)

class InventoryRiskResponse(BaseModel):
    sku_id: str
    product_name: str
    current_stock: int
    avg_daily_demand: float
    days_to_stockout: int
    risk_level: RiskLevel
    recommended_reorder_qty: int
    safety_stock: int
    reorder_point: int


# ── Supplier Models ──────────────────────────────────────────────────────────

class SupplierCreate(BaseModel):
    supplier_id: str = Field(..., example="SUP-001")
    name: str = Field(..., example="GlobalParts Co.")
    region: str = Field(..., example="China")
    on_time_rate: float = Field(..., ge=0, le=1, example=0.91)
    quality_score: float = Field(..., ge=0, le=100, example=88.0)
    defect_rate: float = Field(default=0.02, ge=0)
    avg_lead_time: float = Field(default=14.0, gt=0)

class SupplierResponse(BaseModel):
    supplier_id: str
    name: str
    region: str
    on_time_rate: float
    quality_score: float
    risk_score: float
    risk_level: RiskLevel


# ── Prediction Models ─────────────────────────────────────────────────────────

class DelayPredictionRequest(BaseModel):
    origin: str = Field(..., example="Mumbai")
    destination: str = Field(..., example="Los Angeles")
    carrier: str = Field(..., example="Maersk")
    cargo_type: str = Field(..., example="Electronics")
    weight_kg: float = Field(..., gt=0, example=12500)
    distance_km: float = Field(default=8000, gt=0)
    departure_date: Optional[datetime] = None

class DelayPredictionResponse(BaseModel):
    delay_probability: float
    expected_delay_days: float
    risk_level: RiskLevel
    shap_importance: Dict[str, float]
    model: str
    recommendation: str

class InventoryRiskRequest(BaseModel):
    sku_id: str
    current_stock: int = Field(..., ge=0)
    avg_daily_demand: float = Field(..., gt=0)
    lead_time_days: int = Field(default=7, ge=1)

class SupplierRiskRequest(BaseModel):
    supplier_id: str
    on_time_rate: float = Field(..., ge=0, le=1)
    quality_score: float = Field(..., ge=0, le=100)
    defect_rate: float = Field(default=0.02)
    avg_lead_time: float = Field(default=14.0)


# ── Analytics Models ──────────────────────────────────────────────────────────

class AnalyticsResponse(BaseModel):
    period: str
    total_shipments: int
    delayed_shipments: int
    delay_rate: float
    avg_delay_days: float
    cost_impact: float


# ── Upload Model ──────────────────────────────────────────────────────────────

class UploadResponse(BaseModel):
    filename: str
    records_processed: int
    status: str
    errors: List[str] = []
    warnings: List[str] = []
