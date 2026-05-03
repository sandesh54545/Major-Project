"""
MongoDB Database Connection Utility
Uses Motor (async MongoDB driver)
"""

import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "supply_chain_db")

client = None
db = None

async def connect_db():
    global client, db
    try:
        client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        # Ping to confirm connection
        await client.admin.command("ping")
        print(f"✅ Connected to MongoDB: {DB_NAME}")
        # Create indexes
        await create_indexes()
    except Exception as e:
        print(f"⚠️  MongoDB connection failed: {e}")
        print("   Running in demo mode with sample data")

async def disconnect_db():
    global client
    if client:
        client.close()

async def create_indexes():
    """Create indexes for performance"""
    if db is None:
        return
    try:
        await db.shipments.create_index("shipment_id", unique=True)
        await db.shipments.create_index("status")
        await db.inventory.create_index("sku_id", unique=True)
        await db.suppliers.create_index("supplier_id", unique=True)
        print("✅ Database indexes created")
    except Exception as e:
        print(f"Index creation warning: {e}")

def get_db():
    return db
