const FMP_BASE = 'https://financialmodelingprep.com/stable'

async function fetchQuote(symbol, apiKey) {
  try {
    const r = await fetch(`${FMP_BASE}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`)
    if (!r.ok) return { symbol, error: r.status }
    const data = await r.json()
    return { symbol, ok: true, data: Array.isArray(data) ? data[0] : data }
  } catch (e) {
    return { symbol, error: e.message }
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const apiKey = process.env.FMP_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'No API key' })

  // Test just 5 symbols — 2 US, 2 LSE, 1 Europe
  const testSymbols = ['KO', 'JPM', 'HSBA.L', 'BP.L', 'ALV.DE']
  const results = await Promise.all(testSymbols.map(s => fetchQuote(s, apiKey)))

  return res.status(200).json({
    tested: testSymbols,
    results,
    apiKeyPresent: !!apiKey,
    apiKeyLength: apiKey.length,
  })
}