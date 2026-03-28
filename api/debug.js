const FMP_BASE = 'https://financialmodelingprep.com/stable'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const apiKey = process.env.FMP_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'No API key' })

  const results = {}

  // Test 1: Stock screener — dividend paying stocks, US exchanges
  try {
    const r = await fetch(`${FMP_BASE}/company-screener?dividendMoreThan=0&exchange=NYSE,NASDAQ&limit=10&apikey=${apiKey}`)
    const d = await r.json()
    results.screener_us = {
      status: r.status,
      count: Array.isArray(d) ? d.length : 0,
      sample: Array.isArray(d) ? d[0] : d,
    }
  } catch (e) {
    results.screener_us = { error: e.message }
  }

  // Test 2: Stock screener — LSE
  try {
    const r = await fetch(`${FMP_BASE}/company-screener?dividendMoreThan=0&exchange=LSE&limit=10&apikey=${apiKey}`)
    const d = await r.json()
    results.screener_lse = {
      status: r.status,
      count: Array.isArray(d) ? d.length : 0,
      sample: Array.isArray(d) ? d[0] : d,
    }
  } catch (e) {
    results.screener_lse = { error: e.message }
  }

  // Test 3: Quote for single symbol
  try {
    const r = await fetch(`${FMP_BASE}/quote?symbol=AAPL&apikey=${apiKey}`)
    const d = await r.json()
    results.quote_aapl = {
      status: r.status,
      sample: Array.isArray(d) ? d[0] : d,
    }
  } catch (e) {
    results.quote_aapl = { error: e.message }
  }

  // Test 4: Dividend calendar
  try {
    const r = await fetch(`${FMP_BASE}/dividends-calendar?from=2026-03-01&to=2026-04-30&apikey=${apiKey}`)
    const d = await r.json()
    results.dividends_calendar = {
      status: r.status,
      count: Array.isArray(d) ? d.length : 0,
      sample: Array.isArray(d) ? d[0] : d,
    }
  } catch (e) {
    results.dividends_calendar = { error: e.message }
  }

  return res.status(200).json(results)
}
