from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class StockHolding(BaseModel):
    id: Optional[str] = None
    user_id: str
    symbol: str
    name: str
    shares: float
    average_cost: float
    current_price: float
    total_value: float
    gain_loss: float
    gain_loss_percent: float
    last_updated: datetime

class Account(BaseModel):
    id: Optional[str] = None
    user_id: str
    name: str
    type: str  # "checking", "savings", "investment", etc.
    balance: float
    currency: str = "USD"
    last_updated: datetime

# Mock data for demo user
mock_holdings = [
    {
        "id": "1",
        "user_id": "demo",
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "shares": 50,
        "average_cost": 150.00,
        "current_price": 175.23,
        "total_value": 8761.50,
        "gain_loss": 1261.50,
        "gain_loss_percent": 16.82,
        "last_updated": datetime.now()
    },
    {
        "id": "2",
        "user_id": "demo",
        "symbol": "GOOGL",
        "name": "Alphabet Inc.",
        "shares": 25,
        "average_cost": 120.00,
        "current_price": 142.56,
        "total_value": 3564.00,
        "gain_loss": 564.00,
        "gain_loss_percent": 18.80,
        "last_updated": datetime.now()
    },
    {
        "id": "3",
        "user_id": "demo",
        "symbol": "MSFT",
        "name": "Microsoft Corporation",
        "shares": 30,
        "average_cost": 300.00,
        "current_price": 378.85,
        "total_value": 11365.50,
        "gain_loss": 2365.50,
        "gain_loss_percent": 26.28,
        "last_updated": datetime.now()
    },
    {
        "id": "4",
        "user_id": "demo",
        "symbol": "TSLA",
        "name": "Tesla, Inc.",
        "shares": 15,
        "average_cost": 200.00,
        "current_price": 248.42,
        "total_value": 3726.30,
        "gain_loss": 726.30,
        "gain_loss_percent": 24.21,
        "last_updated": datetime.now()
    },
    {
        "id": "5",
        "user_id": "demo",
        "symbol": "NVDA",
        "name": "NVIDIA Corporation",
        "shares": 20,
        "average_cost": 400.00,
        "current_price": 485.09,
        "total_value": 9701.80,
        "gain_loss": 1701.80,
        "gain_loss_percent": 21.27,
        "last_updated": datetime.now()
    }
]

mock_accounts = [
    {
        "id": "1",
        "user_id": "demo",
        "name": "Chase Checking",
        "type": "checking",
        "balance": 12500.75,
        "currency": "USD",
        "last_updated": datetime.now()
    },
    {
        "id": "2",
        "user_id": "demo",
        "name": "Chase Savings",
        "type": "savings",
        "balance": 18500.00,
        "currency": "USD",
        "last_updated": datetime.now()
    },
    {
        "id": "3",
        "user_id": "demo",
        "name": "Credit Union",
        "type": "checking",
        "balance": 1000.00,
        "currency": "USD",
        "last_updated": datetime.now()
    }
]

@router.get("/holdings/{user_id}")
async def get_user_holdings(user_id: str) -> List[StockHolding]:
    """Get all stock holdings for a user"""
    if user_id == "demo":
        return [StockHolding(**holding) for holding in mock_holdings]
    return []

@router.get("/holdings/{user_id}/summary")
async def get_holdings_summary(user_id: str):
    """Get summary of holdings (total value, gain/loss)"""
    if user_id == "demo":
        holdings = [StockHolding(**holding) for holding in mock_holdings]
        total_value = sum(holding.total_value for holding in holdings)
        total_gain_loss = sum(holding.gain_loss for holding in holdings)
        total_invested = sum(holding.shares * holding.average_cost for holding in holdings)
        total_gain_loss_percent = (total_gain_loss / total_invested * 100) if total_invested > 0 else 0
        
        return {
            "total_value": round(total_value, 2),
            "total_gain_loss": round(total_gain_loss, 2),
            "total_gain_loss_percent": round(total_gain_loss_percent, 2),
            "total_invested": round(total_invested, 2),
            "holdings_count": len(holdings)
        }
    return {
        "total_value": 0,
        "total_gain_loss": 0,
        "total_gain_loss_percent": 0,
        "total_invested": 0,
        "holdings_count": 0
    }

# Legacy endpoints (keeping for compatibility)
@router.get("/")
async def get_assets():
    return {"message": "Get assets endpoint"}

@router.post("/")
async def create_asset():
    return {"message": "Create asset endpoint"}

@router.get("/{asset_id}")
async def get_asset(asset_id: str):
    return {"message": f"Get asset {asset_id} endpoint"}

@router.put("/{asset_id}")
async def update_asset(asset_id: str):
    return {"message": f"Update asset {asset_id} endpoint"}

@router.delete("/{asset_id}")
async def delete_asset(asset_id: str):
    return {"message": f"Delete asset {asset_id} endpoint"} 