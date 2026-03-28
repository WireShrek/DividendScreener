# DIVSCREEN

A fast, clean dividend screener covering NASDAQ, S&P 500, NYSE, LSE and major European exchanges.

Built with React + Vite. Deployed on Vercel.

## Features

- Screener with search, exchange filter, advanced filters (yield range, sector, div/share)
- Sortable table with paginated results
- Dividend calendar — chronological timeline of ex-dates and payment dates
- Dark theme throughout

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Deploy to Vercel

Push to GitHub, import the repo in Vercel, hit Deploy. No configuration needed — Vite is auto-detected.

## Project structure

```
src/
  components/
    TopBar.jsx         # Nav bar with tab routing
    FilterBar.jsx      # Search, exchange tabs, advanced filters
    StockTable.jsx     # Sortable paginated table
  pages/
    Screener.jsx       # Main screener page
    Calendar.jsx       # Dividend calendar page
  hooks/
    useScreener.js     # All filter/sort/pagination logic
  data/
    stocks.js          # Stock data + constants
  utils/
    format.js          # Price/yield formatting helpers
```

## Connecting a real API

The data currently lives in `src/data/stocks.js` as a static array.
To wire up a live data source (e.g. Financial Modeling Prep):

1. Add your API key to a `.env` file: `VITE_FMP_API_KEY=your_key_here`
2. Replace the `STOCKS` import in `useScreener.js` with a `useQuery` hook that fetches from FMP
3. The rest of the app stays the same — components only care about the shape of the data
