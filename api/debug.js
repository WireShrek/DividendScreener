const FMP_BASE = 'https://financialmodelingprep.com/api/v3'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (!process.env.FMP_API_KEY) {
    return res.status(500).json({ error: 'FMP_API_KEY not configured' })
  }

  const apiKey = process.env.FMP_API_KEY

  // Test a small batch of 5 symbols to see what FMP returns
  const testSymbols = ['AAPL', 'MSFT', 'HSBA.L', 'BNP.PA', 'ALV.DE']

  try {
    const url = `${FMP_BASE}/profile/${testSymbols.join(',')}?apikey=${apiKey}`
    const res2 = await fetch(url)
    const raw = await res2.json()

    return res.status(200).json({
      status: res2.status,
      symbolsTested: testSymbols,
      profilesReturned: Array.isArray(raw) ? raw.length : 0,
      firstProfile: Array.isArray(raw) && raw[0] ? {
        symbol: raw[0].symbol,
        price: raw[0].price,
        lastDiv: raw[0].lastDiv,
        exchangeShortName: raw[0].exchangeShortName,
        currency: raw[0].currency,
      } : raw,
      rawError: !Array.isArray(raw) ? raw : null,
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
