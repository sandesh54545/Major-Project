"""
Recommendations Routes - AI-generated actionable insights
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_recommendations():
    return {
        "critical": [
            {
                "id": "REC-001", "priority": "CRITICAL",
                "title": "Expedite SKU-8821 reorder immediately",
                "description": "Current stock will deplete in 3 days. Activate emergency supplier FastShip LLC.",
                "estimated_cost": 14200, "action": "REORDER",
            },
            {
                "id": "REC-002", "priority": "CRITICAL",
                "title": "Reroute SH-2041 via Pacific North",
                "description": "Current route has 87% delay probability. Alternative reduces risk to 23%.",
                "estimated_cost": 2800, "action": "REROUTE",
            },
        ],
        "warnings": [
            {
                "id": "REC-003", "priority": "HIGH",
                "title": "Qualify backup supplier for TechParts-IN",
                "description": "Reliability dropped to 61%. Recommend onboarding EuroPrecision as secondary source.",
                "estimated_cost": 0, "action": "SUPPLIER",
            },
        ],
        "optimizations": [
            {
                "id": "REC-004", "priority": "MEDIUM",
                "title": "Increase safety stock for Q2 demand spike",
                "description": "ML model forecasts 32% demand increase. Raise safety stock buffer from 15% to 25%.",
                "estimated_savings": 0,
            },
            {
                "id": "REC-005", "priority": "MEDIUM",
                "title": "Consolidate Hamburg→Asia shipments",
                "description": "3 separate shipments can be consolidated. Estimated savings: $8,400.",
                "estimated_savings": 8400,
            },
        ],
    }


@router.post("/{rec_id}/action")
async def take_action(rec_id: str, action: str = "approve"):
    return {"rec_id": rec_id, "action": action, "status": "COMPLETED", "message": f"Action '{action}' recorded for {rec_id}"}
