from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class Account(BaseModel):
    id: Optional[str] = None
    user_id: str
    name: str
    type: str  # "checking", "savings", "investment", etc.
    balance: float
    currency: str = "USD"
    last_updated: datetime

# Mock data for demo user (same as in assets.py)
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

@router.get("/{user_id}")
async def get_user_accounts(user_id: str) -> List[Account]:
    """Get all accounts for a user"""
    if user_id == "demo":
        return [Account(**account) for account in mock_accounts]
    return []

@router.get("/{user_id}/summary")
async def get_accounts_summary(user_id: str):
    """Get summary of accounts (total balance)"""
    if user_id == "demo":
        accounts = [Account(**account) for account in mock_accounts]
        total_balance = sum(account.balance for account in accounts)
        
        return {
            "total_balance": round(total_balance, 2),
            "accounts_count": len(accounts),
            "accounts": [
                {
                    "name": account.name,
                    "type": account.type,
                    "balance": account.balance
                }
                for account in accounts
            ]
        }
    return {
        "total_balance": 0,
        "accounts_count": 0,
        "accounts": []
    }

# Legacy endpoints (keeping for compatibility)
@router.get("/")
async def get_accounts():
    return {"message": "Get accounts endpoint"}

@router.post("/")
async def create_account():
    return {"message": "Create account endpoint"}

@router.get("/{account_id}")
async def get_account(account_id: str):
    return {"message": f"Get account {account_id} endpoint"}

@router.put("/{account_id}")
async def update_account(account_id: str):
    return {"message": f"Update account {account_id} endpoint"}

@router.delete("/{account_id}")
async def delete_account(account_id: str):
    return {"message": f"Delete account {account_id} endpoint"} 