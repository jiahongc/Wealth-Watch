from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

router = APIRouter()

class StockSymbol(BaseModel):
    symbol: str

class StockData(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float
    market_cap: Optional[float] = None
    volume: Optional[int] = None
    last_updated: datetime

class StockHolding(BaseModel):
    id: Optional[int] = None
    user_id: str
    symbol: str
    shares: float
    average_cost: float
    current_price: float
    total_value: float
    gain_loss: float
    gain_loss_percent: float
    created_at: Optional[datetime] = None

@router.get("/quote/{symbol}")
async def get_stock_quote(symbol: str) -> StockData:
    """Get real-time stock quote"""
    try:
        stock = yf.Ticker(symbol.upper())
        info = stock.info
        hist = stock.history(period="2d")
        
        if hist.empty:
            raise HTTPException(status_code=404, detail="Stock symbol not found")
        
        current_price = hist['Close'].iloc[-1]
        previous_price = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
        change = current_price - previous_price
        change_percent = (change / previous_price) * 100 if previous_price != 0 else 0
        
        return StockData(
            symbol=symbol.upper(),
            name=info.get('longName', symbol.upper()),
            price=round(current_price, 2),
            change=round(change, 2),
            change_percent=round(change_percent, 2),
            market_cap=info.get('marketCap'),
            volume=info.get('volume'),
            last_updated=datetime.now()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stock data: {str(e)}")

@router.post("/quotes")
async def get_multiple_quotes(symbols: List[str]) -> List[StockData]:
    """Get quotes for multiple stocks"""
    results = []
    for symbol in symbols:
        try:
            stock_data = await get_stock_quote(symbol)
            results.append(stock_data)
        except:
            # Skip invalid symbols
            continue
    return results

@router.get("/search/{query}")
async def search_stocks(query: str) -> List[dict]:
    """Search for stocks by name or symbol"""
    try:
        # This is a simplified search - in production, you'd use a proper search API
        # For now, we'll try to get info for the query as a symbol
        stock = yf.Ticker(query.upper())
        info = stock.info
        
        if 'longName' in info:
            return [{
                'symbol': query.upper(),
                'name': info.get('longName', ''),
                'sector': info.get('sector', ''),
                'industry': info.get('industry', '')
            }]
        else:
            return []
    except:
        return []

@router.get("/trending")
async def get_trending_stocks() -> List[StockData]:
    """Get trending stocks (popular stocks)"""
    # Popular stocks list - in production, this could be dynamic
    popular_symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX']
    
    results = []
    for symbol in popular_symbols[:6]:  # Limit to 6 for performance
        try:
            stock_data = await get_stock_quote(symbol)
            results.append(stock_data)
        except:
            continue
    
    return results

@router.get("/history/{symbol}")
async def get_stock_history(symbol: str, period: str = "1mo") -> dict:
    """Get historical stock data"""
    try:
        stock = yf.Ticker(symbol.upper())
        hist = stock.history(period=period)
        
        if hist.empty:
            raise HTTPException(status_code=404, detail="Stock symbol not found")
        
        # Convert to format suitable for charts
        data = []
        for date, row in hist.iterrows():
            data.append({
                'date': date.strftime('%Y-%m-%d'),
                'open': round(row['Open'], 2),
                'high': round(row['High'], 2),
                'low': round(row['Low'], 2),
                'close': round(row['Close'], 2),
                'volume': int(row['Volume'])
            })
        
        return {
            'symbol': symbol.upper(),
            'period': period,
            'data': data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching historical data: {str(e)}")

# Holdings endpoints would typically require authentication
@router.post("/holdings")
async def add_stock_holding(holding: StockHolding) -> StockHolding:
    """Add a new stock holding"""
    # In production, this would save to database
    # For now, return the holding with calculated values
    try:
        current_price_data = await get_stock_quote(holding.symbol)
        holding.current_price = current_price_data.price
        holding.total_value = holding.shares * holding.current_price
        holding.gain_loss = holding.total_value - (holding.shares * holding.average_cost)
        holding.gain_loss_percent = (holding.gain_loss / (holding.shares * holding.average_cost)) * 100
        holding.created_at = datetime.now()
        
        return holding
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding stock holding: {str(e)}")

@router.get("/holdings/{user_id}")
async def get_user_holdings(user_id: str) -> List[StockHolding]:
    """Get all stock holdings for a user"""
    # In production, this would fetch from database
    # For now, return empty list
    return [] 