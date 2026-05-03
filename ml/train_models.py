"""
ML Model Training Script
Run this to pre-train and save all models to disk.
Usage: python ml/train_models.py
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from services.ml_service import get_delay_model, get_inventory_model, get_supplier_model

if __name__ == '__main__':
    print("=" * 50)
    print("Supply Chain Risk Prediction — Model Training")
    print("=" * 50)

    print("\n[1/3] Training Shipment Delay Model (XGBoost)...")
    model = get_delay_model()
    # Test prediction
    result = model.predict("Mumbai", "Los Angeles", "Maersk", "Electronics", 15000)
    print(f"      Test prediction: {result['delay_probability']}% delay probability")

    print("\n[2/3] Initializing Inventory Forecast Model...")
    inv_model = get_inventory_model()
    result = inv_model.predict_stockout(500, 80, 7)
    print(f"      Test: 500 units / 80 per day = {result['days_to_stockout']} days ({result['risk_level']})")

    print("\n[3/3] Initializing Supplier Risk Scorer...")
    sup_model = get_supplier_model()
    result = sup_model.calculate_risk_score(0.91, 88, 0.015, 12)
    print(f"      Test: GlobalParts score = {result['risk_score']} ({result['risk_level']})")

    print("\n✅ All models ready! Start the server with:")
    print("   cd backend && uvicorn main:app --reload")
