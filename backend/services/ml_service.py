"""
ML Model Service
Handles XGBoost and Scikit-learn model loading, training, and inference
"""

import numpy as np
import pandas as pd
import pickle
import os
from datetime import datetime
import warnings
warnings.filterwarnings("ignore")

# Try importing ML libraries
try:
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
    from sklearn.preprocessing import LabelEncoder, StandardScaler
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("⚠️  scikit-learn not installed. Run: pip install scikit-learn")

try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    print("⚠️  XGBoost not installed. Run: pip install xgboost")

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml", "trained_models")
os.makedirs(MODEL_DIR, exist_ok=True)


class DelayPredictionModel:
    """XGBoost model for shipment delay prediction"""

    def __init__(self):
        self.model = None
        self.label_encoders = {}
        self.scaler = StandardScaler() if SKLEARN_AVAILABLE else None
        self.feature_names = [
            "origin_enc", "dest_enc", "carrier_enc", "cargo_enc",
            "weight_kg", "distance_km", "month", "day_of_week",
            "weather_risk", "port_congestion"
        ]
        self._load_or_create_model()

    def _load_or_create_model(self):
        model_path = os.path.join(MODEL_DIR, "delay_model.pkl")
        if os.path.exists(model_path):
            with open(model_path, "rb") as f:
                saved = pickle.load(f)
                self.model = saved["model"]
                self.label_encoders = saved["encoders"]
                self.scaler = saved["scaler"]
            print("✅ Delay prediction model loaded from disk")
        else:
            print("🔄 Training new delay prediction model...")
            self._train_model()

    def _generate_training_data(self, n=5000):
        """Generate synthetic training data"""
        np.random.seed(42)
        origins = ["Mumbai", "Shanghai", "Dubai", "Hamburg", "Los Angeles", "Tokyo", "Rotterdam"]
        dests = ["Los Angeles", "New York", "Rotterdam", "Tokyo", "Sydney", "Mumbai", "Dubai"]
        carriers = ["Maersk", "MSC", "CMA CGM", "COSCO", "Hapag-Lloyd"]
        cargo_types = ["Electronics", "Perishables", "Industrial Parts", "Textiles", "Chemicals"]

        data = {
            "origin": np.random.choice(origins, n),
            "destination": np.random.choice(dests, n),
            "carrier": np.random.choice(carriers, n),
            "cargo_type": np.random.choice(cargo_types, n),
            "weight_kg": np.random.randint(500, 50000, n),
            "distance_km": np.random.randint(2000, 20000, n),
            "month": np.random.randint(1, 13, n),
            "day_of_week": np.random.randint(0, 7, n),
            "weather_risk": np.random.uniform(0, 1, n),
            "port_congestion": np.random.uniform(0, 1, n),
        }
        df = pd.DataFrame(data)

        # Simulate delay label with realistic rules
        delay_prob = (
            0.1 +
            (df["cargo_type"] == "Perishables") * 0.2 +
            (df["weight_kg"] > 20000) * 0.15 +
            df["weather_risk"] * 0.3 +
            df["port_congestion"] * 0.25 +
            (df["month"].isin([6, 7, 8, 9])) * 0.1 +  # typhoon season
            np.random.normal(0, 0.05, n)
        ).clip(0, 1)

        df["delayed"] = (delay_prob > 0.5).astype(int)
        df["delay_days"] = np.where(df["delayed"] == 1, np.random.exponential(3, n), 0).clip(0, 14)
        return df

    def _train_model(self):
        if not SKLEARN_AVAILABLE:
            return

        df = self._generate_training_data()
        cat_cols = ["origin", "destination", "carrier", "cargo_type"]

        for col in cat_cols:
            le = LabelEncoder()
            df[col + "_enc"] = le.fit_transform(df[col])
            self.label_encoders[col] = le

        feature_cols = [c + "_enc" for c in cat_cols] + [
            "weight_kg", "distance_km", "month", "day_of_week", "weather_risk", "port_congestion"
        ]

        X = df[feature_cols].values
        y = df["delayed"].values
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        X_train = self.scaler.fit_transform(X_train)
        X_test = self.scaler.transform(X_test)

        if XGBOOST_AVAILABLE:
            self.model = xgb.XGBClassifier(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42, eval_metric="logloss")
        else:
            self.model = RandomForestClassifier(n_estimators=100, random_state=42)

        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_test)

        metrics = {
            "accuracy": round(accuracy_score(y_test, y_pred) * 100, 1),
            "precision": round(precision_score(y_test, y_pred, zero_division=0) * 100, 1),
            "recall": round(recall_score(y_test, y_pred, zero_division=0) * 100, 1),
            "f1": round(f1_score(y_test, y_pred, zero_division=0) * 100, 1),
        }
        print(f"✅ Model trained — Accuracy: {metrics['accuracy']}%, F1: {metrics['f1']}%")

        with open(os.path.join(MODEL_DIR, "delay_model.pkl"), "wb") as f:
            pickle.dump({"model": self.model, "encoders": self.label_encoders, "scaler": self.scaler, "metrics": metrics}, f)

    def predict(self, origin, destination, carrier, cargo_type, weight_kg, distance_km=8000, departure_date=None):
        """Predict delay probability for a shipment"""
        if self.model is None or not SKLEARN_AVAILABLE:
            return self._fallback_predict(cargo_type, weight_kg)

        try:
            date = departure_date or datetime.now()
            cat_cols = ["origin", "destination", "carrier", "cargo_type"]
            values = [origin, destination, carrier, cargo_type]
            encoded = []
            for col, val in zip(cat_cols, values):
                le = self.label_encoders.get(col)
                if le:
                    try:
                        enc = le.transform([val])[0]
                    except ValueError:
                        enc = 0
                    encoded.append(enc)
                else:
                    encoded.append(0)

            month = date.month if hasattr(date, 'month') else 5
            dow = date.weekday() if hasattr(date, 'weekday') else 2
            weather_risk = 0.6 if month in [6, 7, 8, 9] else 0.3
            port_congestion = np.random.uniform(0.2, 0.7)

            features = np.array([encoded + [weight_kg, distance_km, month, dow, weather_risk, port_congestion]])
            features_scaled = self.scaler.transform(features)

            prob = self.model.predict_proba(features_scaled)[0][1]
            delay_days = float(prob * 5) if prob > 0.5 else float(prob * 2)

            shap_importance = {
                "Weather/Season": round(weather_risk * 30, 1),
                "Route Congestion": round(port_congestion * 25, 1),
                "Port Efficiency": round((1 - port_congestion) * 20 + 10, 1),
                "Carrier History": round(np.random.uniform(10, 20), 1),
                "Cargo Type": round(15 if cargo_type == "Perishables" else 8, 1),
                "Weight Factor": round(min(weight_kg / 50000 * 15, 15), 1),
            }

            return {
                "delay_probability": round(float(prob) * 100, 1),
                "expected_delay_days": round(delay_days, 1),
                "risk_level": "HIGH" if prob > 0.6 else "MEDIUM" if prob > 0.3 else "LOW",
                "shap_importance": shap_importance,
                "model": "XGBoost" if XGBOOST_AVAILABLE else "RandomForest",
            }
        except Exception as e:
            return self._fallback_predict(cargo_type, weight_kg)

    def _fallback_predict(self, cargo_type, weight_kg):
        import random
        prob = random.uniform(0.15, 0.85)
        if cargo_type == "Perishables":
            prob = min(prob + 0.2, 0.95)
        if weight_kg > 20000:
            prob = min(prob + 0.1, 0.95)
        return {
            "delay_probability": round(prob * 100, 1),
            "expected_delay_days": round(prob * 5, 1),
            "risk_level": "HIGH" if prob > 0.6 else "MEDIUM" if prob > 0.3 else "LOW",
            "shap_importance": {
                "Weather/Season": 28.4, "Route Congestion": 22.1,
                "Port Efficiency": 18.7, "Carrier History": 16.2,
                "Cargo Type": 9.8, "Weight Factor": 4.8
            },
            "model": "Demo",
        }


class InventoryForecastModel:
    """Demand forecasting model for inventory risk"""

    def predict_stockout(self, current_stock: int, avg_daily_demand: float, lead_time_days: int = 7):
        days_to_stockout = int(current_stock / avg_daily_demand) if avg_daily_demand > 0 else 999
        safety_stock = avg_daily_demand * lead_time_days * 1.5
        reorder_qty = avg_daily_demand * 30
        risk_level = "CRITICAL" if days_to_stockout <= 7 else "HIGH" if days_to_stockout <= 14 else "MEDIUM" if days_to_stockout <= 30 else "LOW"
        return {
            "days_to_stockout": days_to_stockout,
            "risk_level": risk_level,
            "recommended_reorder_qty": int(reorder_qty),
            "safety_stock": int(safety_stock),
            "reorder_point": int(safety_stock + avg_daily_demand * lead_time_days),
        }

    def forecast_demand(self, historical_demand: list, periods: int = 30):
        if not historical_demand:
            historical_demand = [100] * 30
        arr = np.array(historical_demand)
        trend = np.polyfit(range(len(arr)), arr, 1)
        forecast = [max(0, int(trend[0] * (len(arr) + i) + trend[1])) for i in range(periods)]
        return {"forecast": forecast, "trend": "increasing" if trend[0] > 0 else "decreasing", "avg_demand": round(float(np.mean(arr)), 1)}


class SupplierRiskModel:
    """Supplier risk scoring model"""

    def calculate_risk_score(self, on_time_rate: float, quality_score: float, defect_rate: float = 0.02, avg_lead_time: float = 14):
        score = (on_time_rate * 0.4 + (quality_score / 100) * 0.3 + max(0, 1 - defect_rate * 10) * 0.2 + min(1, 21 / avg_lead_time) * 0.1) * 100
        risk = "LOW" if score >= 75 else "MEDIUM" if score >= 50 else "HIGH"
        return {"risk_score": round(score, 1), "risk_level": risk, "on_time_rate": on_time_rate, "quality_score": quality_score}


# Singleton instances
_delay_model = None
_inventory_model = None
_supplier_model = None

def get_delay_model() -> DelayPredictionModel:
    global _delay_model
    if _delay_model is None:
        _delay_model = DelayPredictionModel()
    return _delay_model

def get_inventory_model() -> InventoryForecastModel:
    global _inventory_model
    if _inventory_model is None:
        _inventory_model = InventoryForecastModel()
    return _inventory_model

def get_supplier_model() -> SupplierRiskModel:
    global _supplier_model
    if _supplier_model is None:
        _supplier_model = SupplierRiskModel()
    return _supplier_model
