from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import requests
import os
from datetime import datetime, timedelta

router = APIRouter()

# Alpha Vantage API key
ALPHA_VANTAGE_API_KEY = os.getenv('ALPHA_VANTAGE_API_KEY', 'demo')

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
    """Get real-time stock quote using Alpha Vantage"""
    try:
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol.upper()}&apikey={ALPHA_VANTAGE_API_KEY}"
        response = requests.get(url)
        data = response.json()
        
        if "Error Message" in data:
            raise HTTPException(status_code=404, detail="Stock symbol not found")
        
        quote = data.get("Global Quote", {})
        if not quote:
            raise HTTPException(status_code=404, detail="Stock symbol not found")
        
        current_price = float(quote.get("05. price", 0))
        change = float(quote.get("09. change", 0))
        change_percent = float(quote.get("10. change percent", "0%").replace("%", ""))
        volume = int(quote.get("06. volume", 0))
        
        return StockData(
            symbol=symbol.upper(),
            name=symbol.upper(),  # Alpha Vantage doesn't provide company names in GLOBAL_QUOTE
            price=round(current_price, 2),
            change=round(change, 2),
            change_percent=round(change_percent, 2),
            volume=volume,
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
    """Search for stocks by name or symbol using Alpha Vantage"""
    try:
        url = f"https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords={query}&apikey={ALPHA_VANTAGE_API_KEY}"
        response = requests.get(url)
        data = response.json()
        
        matches = data.get("bestMatches", [])
        results = []
        
        for match in matches[:5]:  # Limit to 5 results
            results.append({
                'symbol': match.get('1. symbol', ''),
                'name': match.get('2. name', ''),
                'type': match.get('3. type', ''),
                'region': match.get('4. region', '')
            })
        
        return results
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
    """Get historical stock data using Alpha Vantage"""
    try:
        # Map period to Alpha Vantage function
        function_map = {
            "1d": "TIME_SERIES_INTRADAY",
            "1w": "TIME_SERIES_DAILY",
            "1mo": "TIME_SERIES_DAILY",
            "3mo": "TIME_SERIES_DAILY",
            "6mo": "TIME_SERIES_DAILY",
            "1y": "TIME_SERIES_DAILY"
        }
        
        function = function_map.get(period, "TIME_SERIES_DAILY")
        
        if function == "TIME_SERIES_INTRADAY":
            url = f"https://www.alphavantage.co/query?function={function}&symbol={symbol.upper()}&interval=60min&apikey={ALPHA_VANTAGE_API_KEY}"
        else:
            url = f"https://www.alphavantage.co/query?function={function}&symbol={symbol.upper()}&apikey={ALPHA_VANTAGE_API_KEY}"
        
        response = requests.get(url)
        data = response.json()
        
        if "Error Message" in data:
            raise HTTPException(status_code=404, detail="Stock symbol not found")
        
        # Get the time series data
        time_series_key = None
        for key in data.keys():
            if "Time Series" in key:
                time_series_key = key
                break
        
        if not time_series_key:
            raise HTTPException(status_code=404, detail="Historical data not found")
        
        time_series = data[time_series_key]
        
        # Convert to format suitable for charts
        data_points = []
        for date, values in time_series.items():
            data_points.append({
                'date': date,
                'open': round(float(values.get('1. open', 0)), 2),
                'high': round(float(values.get('2. high', 0)), 2),
                'low': round(float(values.get('3. low', 0)), 2),
                'close': round(float(values.get('4. close', 0)), 2),
                'volume': int(values.get('5. volume', 0))
            })
        
        # Sort by date and limit results
        data_points.sort(key=lambda x: x['date'])
        if period in ["1mo", "3mo"]:
            data_points = data_points[-30:]  # Last 30 days
        elif period == "6mo":
            data_points = data_points[-180:]  # Last 180 days
        elif period == "1y":
            data_points = data_points[-365:]  # Last 365 days
        
        return {
            'symbol': symbol.upper(),
            'period': period,
            'data': data_points
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