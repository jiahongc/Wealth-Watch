# WealthFolio - Personal Finance Tracker

A comprehensive personal finance application built with Next.js 14, featuring real-time stock tracking, budget management, and portfolio analytics.

## 🚀 Features

### ✅ Completed Features
- **Real-time Stock Tracking**: Live stock prices using yfinance integration
- **Portfolio Management**: Add, remove, and track stock holdings with real-time calculations
- **Interactive Watchlist**: Add/remove stocks with live price updates
- **Budget Tracking**: Complete budget and expense management system
- **Modern UI**: Clean, responsive design with Tailwind CSS and ShadCN UI
- **Dashboard Analytics**: Performance charts and financial summaries

### 🔄 Current Status
- **Frontend**: Fully functional on `http://localhost:8080`
- **Backend**: FastAPI with yfinance integration (optional - frontend works with mock data)
- **Real-time Data**: Automatic fallback to mock data when backend unavailable

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI
- **Charts**: Chart.js, Recharts
- **Backend**: FastAPI, yfinance, PostgreSQL (planned)
- **Authentication**: Firebase Auth (planned)

## 🚀 Quick Start

### Frontend (Required)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Backend (Optional)
```bash
# Navigate to API directory
cd api

# Install Python dependencies
pip install -r ../requirements.txt

# Start FastAPI server
python -m uvicorn main:app --reload --port 8000
```

## 📱 Available Pages

- **Dashboard**: `http://localhost:8080/dashboard` - Overview with charts and watchlist
- **Investments**: `http://localhost:8080/dashboard/investments` - Portfolio management
- **Budget**: `http://localhost:8080/dashboard/budget` - Budget and expense tracking

## 💡 Key Features

### Stock Management
- **Add Stocks**: Enter symbol, shares, and average cost
- **Real-time Prices**: Live market data from yfinance
- **Portfolio Tracking**: Automatic gain/loss calculations
- **Watchlist**: Add/remove stocks with live updates

### Budget System
- **Budget Creation**: Set spending limits by category
- **Expense Tracking**: Log expenses with automatic budget updates
- **Visual Analytics**: Charts showing spending patterns
- **Progress Tracking**: Real-time budget utilization

### Dashboard
- **Performance Charts**: Portfolio performance over time
- **Dividend Tracking**: Dividend income visualization
- **Interactive Watchlist**: Live stock prices with add/remove functionality

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend Setup (Optional)
The frontend works independently with mock data. For real yfinance data:

1. Install Python dependencies: `pip install -r requirements.txt`
2. Start backend: `python -m uvicorn main:app --reload --port 8000`
3. Frontend will automatically detect and use real data

## 📁 Project Structure

```
wealthfolio/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # ShadCN UI components
│   ├── dashboard/        # Dashboard-specific components
│   ├── investments/      # Investment management
│   ├── budget/           # Budget tracking
│   └── layout/           # Layout components
├── lib/                  # Utility functions and API service
├── api/                  # FastAPI backend (optional)
└── public/               # Static assets
```

## 🎨 Design System

- **Theme**: Clean white background with blue accents
- **Primary Colors**: Blue (#3B82F6, #2563EB)
- **Typography**: Inter font family
- **Components**: ShadCN UI for consistency
- **Charts**: Chart.js with blue color scheme

## 🔜 Roadmap

### Phase 4: Enhanced Features
- [ ] User authentication with Firebase
- [ ] Database integration (Supabase/PostgreSQL)
- [ ] Historical data and advanced analytics
- [ ] Mobile app optimization

### Phase 5: Advanced Features
- [ ] Plaid bank integration
- [ ] Retirement planning tools
- [ ] Tax optimization features
- [ ] Social features and sharing

### Phase 6: Production Deployment
- [ ] Vercel deployment
- [ ] Production database setup
- [ ] Performance optimization
- [ ] Security hardening

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**WealthFolio** - Your personal finance companion for building wealth and achieving financial goals.