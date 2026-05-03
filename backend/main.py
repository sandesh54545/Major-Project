"""
AI-Based Supply Chain Risk Prediction System
Backend - FastAPI Application
Swizosoft (OPC) Private Limited Internship Project
Students: Sandesh K. Walvekar (2MM23CS406) & Shrinivas S. Motar (2MM23CS408)
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import os

from routes import shipments, inventory, suppliers, predictions, analytics, recommendations
from utils.database import connect_db, disconnect_db

app = FastAPI(
    title="Supply Chain Risk Prediction API",
    description="AI-powered supply chain risk prediction system using XGBoost and Scikit-learn",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Event handlers
@app.on_event("startup")
async def startup_event():
    await connect_db()
    print("✅ Connected to MongoDB")
    print("✅ ML Models loaded")

@app.on_event("shutdown")
async def shutdown_event():
    await disconnect_db()

# Mount static files (frontend)
app.mount("/static", StaticFiles(directory="../frontend"), name="static")

# Include routers
app.include_router(shipments.router, prefix="/api/shipments", tags=["Shipments"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(suppliers.router, prefix="/api/suppliers", tags=["Suppliers"])
app.include_router(predictions.router, prefix="/api/predict", tags=["Predictions"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])

@app.get("/")
async def root():
    return FileResponse("../frontend/index.html")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Supply Chain Risk Prediction API",
        "version": "1.0.0",
        "models": ["XGBoost Delay Predictor", "SKLearn Inventory Forecaster", "Supplier Risk Scorer"]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
