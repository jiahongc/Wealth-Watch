from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
import os
from typing import Optional

# Import routers
from routers import auth, assets, stocks, accounts, budget

app = FastAPI(
    title="WealthFolio API",
    description="Personal finance tracking API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:8080",
        "https://wealth-watch-j35r7h3or-jiahongcs-projects.vercel.app",
        "https://wealth-watch-o8nf6qpna-jiahongcs-projects.vercel.app",
        "https://wealth-watch-72emrzn32-jiahongcs-projects.vercel.app",
        "https://wealthfolio-production.up.railway.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NOTE: All live market data is now provided by yfinance (Yahoo Finance). Alpha Vantage is no longer used or referenced in this backend.

# Security
security = HTTPBearer()

# Health check
@app.get("/")
async def root():
    return {"message": "WealthFolio API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(assets.router, prefix="/api/assets", tags=["Assets"])
app.include_router(stocks.router, prefix="/api/stocks", tags=["Stocks"])
app.include_router(accounts.router, prefix="/api/accounts", tags=["Accounts"])
app.include_router(budget.router, prefix="/api/budget", tags=["Budget"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 