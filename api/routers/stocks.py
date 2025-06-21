from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import requests
import os
from datetime import datetime, timedelta
import random
import time
import yfinance as yf
import talib
import pandas as pd

router = APIRouter()

# Alpha Vantage API key
ALPHA_VANTAGE_API_KEY = os.getenv('ALPHA_VANTAGE_API_KEY', 'T695EA0D7EGRZ11H')

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

class CryptoData(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float
    market_cap: Optional[float] = None
    volume: Optional[float] = None
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
    """Get real-time stock quote using Alpha Vantage or Yahoo Finance fallback"""
    try:
        # Try Alpha Vantage first
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol.upper()}&apikey={ALPHA_VANTAGE_API_KEY}"
        response = requests.get(url)
        data = response.json()
        
        print(f"Alpha Vantage API response for {symbol}: {data}")
        
        # Check for rate limit or API key issues
        if "Information" in data:
            print(f"Alpha Vantage API limit reached: {data['Information']}")
            # Fallback to Yahoo Finance API
            return await get_stock_quote_yahoo(symbol)
        
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
        print(f"Error fetching stock data for {symbol}: {e}")
        # Try Yahoo Finance as fallback
        try:
            return await get_stock_quote_yahoo(symbol)
        except:
            # Final fallback to mock data
            return get_mock_stock_data(symbol)

async def get_stock_quote_yahoo(symbol: str) -> StockData:
    """Get stock quote using Yahoo Finance API"""
    try:
        # Yahoo Finance API endpoint
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol.upper()}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        data = response.json()
        
        print(f"Yahoo Finance API response for {symbol}: {data}")
        
        if 'chart' in data and 'result' in data['chart'] and data['chart']['result']:
            result = data['chart']['result'][0]
            meta = result.get('meta', {})
            
            current_price = meta.get('regularMarketPrice', 0)
            previous_close = meta.get('previousClose', current_price)
            change = current_price - previous_close
            change_percent = (change / previous_close * 100) if previous_close > 0 else 0
            
            return StockData(
                symbol=symbol.upper(),
                name=symbol.upper(),
                price=round(current_price, 2),
                change=round(change, 2),
                change_percent=round(change_percent, 2),
                volume=meta.get('volume', 0),
                last_updated=datetime.now()
            )
        else:
            raise Exception("No data found in Yahoo Finance response")
    except Exception as e:
        print(f"Yahoo Finance API error for {symbol}: {e}")
        raise e

def get_mock_stock_data(symbol: str) -> StockData:
    """Get mock stock data as final fallback"""
    mock_stock_data = {
        'AAPL': {'price': 175.23, 'change': 2.45, 'change_percent': 1.42, 'name': 'Apple Inc.'},
        'GOOGL': {'price': 142.56, 'change': 0.89, 'change_percent': 0.63, 'name': 'Alphabet Inc.'},
        'MSFT': {'price': 378.85, 'change': -1.23, 'change_percent': -0.32, 'name': 'Microsoft Corporation'},
        'TSLA': {'price': 248.42, 'change': 5.67, 'change_percent': 2.34, 'name': 'Tesla, Inc.'},
        'AMZN': {'price': 156.78, 'change': 3.21, 'change_percent': 2.09, 'name': 'Amazon.com, Inc.'},
        'NVDA': {'price': 485.09, 'change': 12.45, 'change_percent': 2.64, 'name': 'NVIDIA Corporation'},
        'META': {'price': 334.92, 'change': -2.18, 'change_percent': -0.65, 'name': 'Meta Platforms, Inc.'},
        'NFLX': {'price': 567.34, 'change': 8.76, 'change_percent': 1.57, 'name': 'Netflix, Inc.'},
        '^GSPC': {'price': 4567.89, 'change': 23.45, 'change_percent': 0.52, 'name': 'S&P 500'},
        '^DJI': {'price': 34567.89, 'change': 45.67, 'change_percent': 0.13, 'name': 'Dow Jones'},
        '^IXIC': {'price': 14234.56, 'change': -12.34, 'change_percent': -0.09, 'name': 'NASDAQ'},
        '^RUT': {'price': 1890.45, 'change': 15.67, 'change_percent': 0.84, 'name': 'Russell 2000'}
    }
    
    if symbol.upper() in mock_stock_data:
        stock = mock_stock_data[symbol.upper()]
        return StockData(
            symbol=symbol.upper(),
            name=stock['name'],
            price=stock['price'],
            change=stock['change'],
            change_percent=stock['change_percent'],
            volume=1000000,
            last_updated=datetime.now()
        )
    
    raise HTTPException(status_code=404, detail="Stock symbol not found")

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
async def get_stock_history(symbol: str, period: str = "3mo") -> dict:
    """Get historical stock data using Yahoo Finance API with RSI"""
    try:
        # Map period to Yahoo Finance range and interval
        period_map = {
            "1M": {"range": "1mo", "interval": "1d"},
            "3M": {"range": "3mo", "interval": "1d"},
            "6M": {"range": "6mo", "interval": "1d"},
            "YTD": {"range": "ytd", "interval": "1d"},
            "1Y": {"range": "1y", "interval": "1d"},
            "3Y": {"range": "3y", "interval": "1d"}
        }
        
        period_config = period_map.get(period, {"range": "3mo", "interval": "1d"})
        
        # Use yfinance to download data
        ticker = yf.Ticker(symbol.upper())
        data = ticker.history(period=period_config['range'], interval=period_config['interval'])
        
        if data.empty:
            raise Exception("No data found for symbol")
        
        # Calculate RSI
        data['RSI'] = talib.RSI(data['Close'].values, timeperiod=14)
        
        # Convert to format suitable for charts
        data_points = []
        for index, row in data.iterrows():
            data_points.append({
                'date': index.strftime('%Y-%m-%d'),
                'timestamp': int(index.timestamp()),
                'open': round(float(row['Open']), 2),
                'high': round(float(row['High']), 2),
                'low': round(float(row['Low']), 2),
                'close': round(float(row['Close']), 2),
                'volume': int(row['Volume']),
                'rsi': round(float(row['RSI']), 2) if pd.notna(row['RSI']) else None
            })
        
        # Calculate day change percentage for tooltips
        if len(data_points) >= 2:
            for i in range(1, len(data_points)):
                prev_close = data_points[i-1]['close']
                current_close = data_points[i]['close']
                day_change = current_close - prev_close
                day_change_percent = (day_change / prev_close * 100) if prev_close > 0 else 0
                data_points[i]['day_change'] = round(day_change, 2)
                data_points[i]['day_change_percent'] = round(day_change_percent, 2)
            # First data point has no previous day
            data_points[0]['day_change'] = 0
            data_points[0]['day_change_percent'] = 0
        
        return {
            'symbol': symbol.upper(),
            'period': period,
            'data': data_points
        }
    except Exception as e:
        print(f"Yahoo Finance Historical API error for {symbol}: {e}")
        # Fallback to mock data
        return get_mock_historical_data(symbol, period)

def get_mock_historical_data(symbol: str, period: str) -> dict:
    """Get mock historical data as fallback"""
    import random
    from datetime import datetime, timedelta
    
    # Generate mock data points
    data_points = []
    base_price = 100.0
    current_date = datetime.now()
    
    # Number of data points based on period
    point_counts = {
        "1M": 30,
        "3M": 90,
        "6M": 180,
        "YTD": 200,
        "1Y": 365,
        "3Y": 1095
    }
    
    num_points = point_counts.get(period, 90)
    
    for i in range(num_points):
        date = current_date - timedelta(days=num_points-i)
        
        # Generate realistic price movement
        change = random.uniform(-2, 2)
        base_price += change
        base_price = max(base_price, 1.0)  # Ensure price doesn't go below $1
        
        open_price = base_price + random.uniform(-1, 1)
        high_price = max(open_price, base_price) + random.uniform(0, 2)
        low_price = min(open_price, base_price) - random.uniform(0, 2)
        close_price = base_price
        volume = random.randint(1000000, 10000000)
        
        day_change = close_price - open_price
        day_change_percent = (day_change / open_price * 100) if open_price > 0 else 0
        
        data_points.append({
            'date': date.strftime('%Y-%m-%d'),
            'timestamp': int(date.timestamp()),
            'open': round(open_price, 2),
            'high': round(high_price, 2),
            'low': round(low_price, 2),
            'close': round(close_price, 2),
            'volume': volume,
            'day_change': round(day_change, 2),
            'day_change_percent': round(day_change_percent, 2),
            'rsi': round(random.uniform(20, 80), 2)  # Mock RSI between 20-80
        })
    
    return {
        'symbol': symbol.upper(),
        'period': period,
        'data': data_points
    }

@router.get("/crypto/quote/{symbol}")
async def get_crypto_quote(symbol: str) -> CryptoData:
    """Get real-time cryptocurrency quote using Yahoo Finance API"""
    try:
        # Yahoo Finance API endpoint for crypto
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol.upper()}-USD"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        data = response.json()
        
        print(f"Yahoo Finance Crypto API response for {symbol}: {data}")
        
        if 'chart' in data and 'result' in data['chart'] and data['chart']['result']:
            result = data['chart']['result'][0]
            meta = result.get('meta', {})
            
            current_price = meta.get('regularMarketPrice', 0)
            previous_close = meta.get('previousClose', current_price)
            change = current_price - previous_close
            change_percent = (change / previous_close * 100) if previous_close > 0 else 0
            
            return CryptoData(
                symbol=symbol.upper(),
                name=get_crypto_name(symbol.upper()),
                price=round(current_price, 2),
                change=round(change, 2),
                change_percent=round(change_percent, 2),
                volume=meta.get('volume', 0),
                market_cap=meta.get('marketCap', 0),
                last_updated=datetime.now()
            )
        else:
            raise Exception("No data found in Yahoo Finance response")
    except Exception as e:
        print(f"Yahoo Finance Crypto API error for {symbol}: {e}")
        # Fallback to mock data
        return get_mock_crypto_data(symbol)

def get_crypto_name(symbol: str) -> str:
    """Get cryptocurrency full name"""
    crypto_names = {
        'BTC': 'Bitcoin',
        'ETH': 'Ethereum',
        'USDT': 'Tether',
        'BNB': 'Binance Coin',
        'SOL': 'Solana',
        'ADA': 'Cardano',
        'XRP': 'Ripple',
        'DOT': 'Polkadot',
        'DOGE': 'Dogecoin',
        'AVAX': 'Avalanche'
    }
    return crypto_names.get(symbol, symbol)

def get_mock_crypto_data(symbol: str) -> CryptoData:
    """Get mock crypto data as fallback"""
    mock_crypto_data = {
        'BTC': {'price': 43250.67, 'change': 1250.34, 'change_percent': 2.98, 'name': 'Bitcoin'},
        'ETH': {'price': 2650.89, 'change': -45.67, 'change_percent': -1.69, 'name': 'Ethereum'},
        'USDT': {'price': 1.00, 'change': 0.00, 'change_percent': 0.00, 'name': 'Tether'},
        'BNB': {'price': 312.45, 'change': 8.92, 'change_percent': 2.94, 'name': 'Binance Coin'},
        'SOL': {'price': 98.76, 'change': 3.21, 'change_percent': 3.36, 'name': 'Solana'}
    }
    
    if symbol.upper() in mock_crypto_data:
        crypto = mock_crypto_data[symbol.upper()]
        return CryptoData(
            symbol=symbol.upper(),
            name=crypto['name'],
            price=crypto['price'],
            change=crypto['change'],
            change_percent=crypto['change_percent'],
            volume=1000000,
            market_cap=1000000000,
            last_updated=datetime.now()
        )
    
    raise HTTPException(status_code=404, detail="Cryptocurrency symbol not found")

@router.get("/crypto/top")
async def get_top_cryptocurrencies() -> List[CryptoData]:
    """Get top 5 cryptocurrencies by market cap"""
    # Top cryptocurrencies by market cap
    top_cryptos = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL']
    
    results = []
    for symbol in top_cryptos:
        try:
            crypto_data = await get_crypto_quote(symbol)
            results.append(crypto_data)
        except:
            continue
    
    return results

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