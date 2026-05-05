"""
Database Utility — in-memory mode
MongoDB not required.
"""

client = None
db = None

async def connect_db():
    print("✅ Running in in-memory mode — no database required")

async def disconnect_db():
    pass

def get_db():
    return None
