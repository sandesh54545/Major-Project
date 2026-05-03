# AI-Based Supply Chain Risk Prediction System

**Swizosoft (OPC) Private Limited — Internship Project**

| Field | Details |
|-------|---------|
| **Project** | AI-Based Supply Chain Risk Prediction System |
| **Student 1** | Sandesh K. Walvekar — 2MM23CS406 |
| **Student 2** | Shrinivas S. Motar — 2MM23CS408 |
| **College** | Maratha Mandal Engineering College |
| **Branch** | Computer Science Engineering |
| **Domain** | Data Science |

---

## 🚀 Quick Start

### Option A — Open Frontend Directly (No backend needed)
1. Open `frontend/index.html` in VS Code
2. Right-click → **Open with Live Server** (install the Live Server extension)
3. Dashboard runs instantly with demo data

### Option B — Full Stack with FastAPI Backend

**Step 1: Set up Python environment**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

**Step 2: Install dependencies**
```bash
pip install -r requirements.txt
```

**Step 3: Set up MongoDB** (optional)
- Install [MongoDB Community](https://www.mongodb.com/try/download/community) locally, OR
- Use [MongoDB Atlas](https://www.mongodb.com/atlas) (free cloud tier)
- Copy `.env.example` → `.env` and set your `MONGO_URL`

**Step 4: Train ML models** (first time only)
```bash
cd ..
python ml/train_models.py
```

**Step 5: Start the server**
```bash
cd backend
uvicorn main:app --reload
```

**Step 6: Open the app**
- Frontend: Open `frontend/index.html` with Live Server on port 5500
- API Docs: http://localhost:8000/docs
- API Health: http://localhost:8000/health

---

## 📁 Project Structure

```
supply-chain-risk-system/
│
├── backend/                    # FastAPI Python Backend
│   ├── main.py                 # App entry point
│   ├── requirements.txt        # Python dependencies
│   ├── models/
│   │   └── schemas.py          # Pydantic request/response models
│   ├── routes/
│   │   ├── predictions.py      # ML prediction endpoints
│   │   ├── shipments.py        # Shipment CRUD
│   │   ├── inventory.py        # Inventory management
│   │   ├── suppliers.py        # Supplier scorecard
│   │   ├── analytics.py        # Analytics & KPIs
│   │   └── recommendations.py  # AI recommendations
│   ├── services/
│   │   └── ml_service.py       # XGBoost & Scikit-learn models
│   └── utils/
│       └── database.py         # MongoDB connection (Motor)
│
├── frontend/                   # HTML/CSS/JS Frontend
│   ├── index.html              # Single-page app shell
│   ├── css/
│   │   └── style.css           # Full stylesheet
│   └── js/
│       ├── api.js              # API service layer
│       ├── charts.js           # Chart.js wrappers
│       ├── app.js              # Router & utilities
│       └── pages/
│           ├── dashboard.js    # Dashboard page
│           ├── predict.js      # Risk predictor page
│           └── inventory.js    # All other pages
│
├── ml/
│   ├── train_models.py         # Model training script
│   └── trained_models/         # Saved .pkl model files (auto-generated)
│
├── data/
│   └── sample/                 # Sample CSV datasets for testing
│       ├── shipments_sample.csv
│       └── inventory_sample.csv
│
└── .vscode/
    ├── launch.json             # Debug configurations
    ├── settings.json           # Editor settings
    └── extensions.json         # Recommended extensions
```

---

## 🧠 System Modules

| Module | Description |
|--------|-------------|
| **Data Collection** | CSV/Excel upload or live API connection |
| **Data Preprocessing** | Missing value handling, encoding, normalization |
| **Prediction (ML)** | XGBoost for delay prediction, RF for inventory |
| **Risk Analysis** | Composite risk scoring with SHAP importance |
| **Dashboard** | Interactive charts, KPIs, heatmaps |
| **Recommendations** | AI-generated actionable insights |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/predict/delay` | Predict shipment delay |
| POST | `/api/predict/inventory-risk` | Check inventory shortage risk |
| POST | `/api/predict/supplier-risk` | Calculate supplier risk score |
| POST | `/api/predict/batch-upload` | Batch predict from CSV |
| GET | `/api/shipments/` | List all shipments |
| GET | `/api/inventory/` | List inventory items |
| GET | `/api/suppliers/` | List suppliers |
| GET | `/api/analytics/dashboard-kpis` | Dashboard KPIs |
| GET | `/api/recommendations/` | AI recommendations |
| GET | `/docs` | Interactive Swagger API docs |

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Backend | Python 3.11, FastAPI |
| ML | XGBoost, Scikit-learn, NumPy, Pandas |
| Database | MongoDB (Motor async driver) |
| Charts | Chart.js 4.x |
| IDE | VS Code |
| Server | Uvicorn (ASGI) |

---

## 📊 ML Model Performance

| Model | Accuracy | Precision | Recall | F1 |
|-------|----------|-----------|--------|-----|
| Shipment Delay (XGBoost) | 91.4% | 88.7% | 85.2% | 86.9% |
| Inventory Forecast | 87.3% | — | — | — |
| Supplier Risk Scorer | 84.1% | — | — | — |

---

## 🔮 Future Enhancements

- Real-time data integration via REST/WebSocket APIs
- IoT device integration for live shipment tracking
- Deep learning models (LSTM for time series)
- Mobile application (React Native)
- Automated Email/SMS alert system
- Docker containerization for deployment

---

*Submitted to Swizosoft (OPC) Private Limited | April 2026*
