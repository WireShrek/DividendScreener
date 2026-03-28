const FMP_BASE = 'https://financialmodelingprep.com/api/v3'

// Fetch helper
async function fmpGet(path) {
  const apiKey = process.env.FMP_API_KEY
  const url = `${FMP_BASE}${path}&apikey=${apiKey}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`FMP error: ${res.status} on ${path}`)
  return res.json()
}

// Batch profile fetcher — splits into chunks of 50 symbols
async function fetchProfiles(symbols) {
  const profiles = {}
  const chunkSize = 50
  for (let i = 0; i < symbols.length; i += chunkSize) {
    const chunk = symbols.slice(i, i + chunkSize).join(',')
    try {
      const data = await fmpGet(`/profile/${chunk}?`)
      for (const p of data) {
        profiles[p.symbol] = p
      }
    } catch (e) {
      // continue on batch errors — partial data better than none
    }
  }
  return profiles
}

async function fetchSP500() {
  const constituents = await fmpGet('/sp500_constituent?')
  const symbols = constituents.map(c => c.symbol)
  const profiles = await fetchProfiles(symbols)
  return constituents.map(c => {
    const p = profiles[c.symbol]
    const price = p?.price ?? null
    const div = p?.lastDiv ?? null
    const yld = price && div ? (div / price) * 100 : null
    return {
      symbol: c.symbol,
      name: p?.companyName ?? c.name,
      exchange: 'SP500',
      price: price ? +price.toFixed(2) : null,
      dividendPerShare: div && div > 0 ? +div.toFixed(2) : null,
      dividendYield: yld ? +yld.toFixed(2) : null,
      currency: p?.currency ?? 'USD',
      sector: p?.sector ?? c.sector ?? null,
    }
  })
}

async function fetchNasdaq() {
  const constituents = await fmpGet('/nasdaq_constituent?')
  const symbols = constituents.map(c => c.symbol)
  const profiles = await fetchProfiles(symbols)
  return constituents.map(c => {
    const p = profiles[c.symbol]
    const price = p?.price ?? null
    const div = p?.lastDiv ?? null
    const yld = price && div ? (div / price) * 100 : null
    return {
      symbol: c.symbol,
      name: p?.companyName ?? c.name,
      exchange: 'NASDAQ',
      price: price ? +price.toFixed(2) : null,
      dividendPerShare: div && div > 0 ? +div.toFixed(2) : null,
      dividendYield: yld ? +yld.toFixed(2) : null,
      currency: p?.currency ?? 'USD',
      sector: p?.sector ?? c.sector ?? null,
    }
  })
}

async function fetchLSE() {
  const data = await fmpGet('/stock-screener?exchange=LSE&limit=200&')
  return data.map(s => {
    const price = s.price ?? null
    const div = s.lastAnnualDividend ?? null
    const yld = price && div ? (div / price) * 100 : null
    return {
      symbol: s.symbol,
      name: s.companyName,
      exchange: 'LSE',
      price: price ? +price.toFixed(2) : null,
      dividendPerShare: div && div > 0 ? +div.toFixed(2) : null,
      dividendYield: yld ? +yld.toFixed(2) : null,
      currency: 'GBP',
      sector: s.sector ?? null,
    }
  })
}

async function fetchEurope() {
  // Fetch major European exchanges
  const exchanges = ['EURONEXT', 'ETR', 'BIT']
  const results = []
  for (const ex of exchanges) {
    try {
      const data = await fmpGet(`/stock-screener?exchange=${ex}&limit=100&`)
      for (const s of data) {
        const price = s.price ?? null
        const div = s.lastAnnualDividend ?? null
        const yld = price && div ? (div / price) * 100 : null
        results.push({
          symbol: s.symbol,
          name: s.companyName,
          exchange: 'EUROPE',
          price: price ? +price.toFixed(2) : null,
          dividendPerShare: div && div > 0 ? +div.toFixed(2) : null,
          dividendYield: yld ? +yld.toFixed(2) : null,
          currency: s.currency ?? 'EUR',
          sector: s.sector ?? null,
        })
      }
    } catch (e) {
      // continue
    }
  }
  return results
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  if (!process.env.FMP_API_KEY) {
    return res.status(500).json({ error: 'FMP_API_KEY not configured' })
  }

  try {
    // Fetch all exchanges in parallel
    const [sp500, nasdaq, lse, europe] = await Promise.allSettled([
      fetchSP500(),
      fetchNasdaq(),
      fetchLSE(),
      fetchEurope(),
    ])

    const stocks = [
      ...(sp500.status  === 'fulfilled' ? sp500.value  : []),
      ...(nasdaq.status === 'fulfilled' ? nasdaq.value : []),
      ...(lse.status    === 'fulfilled' ? lse.value    : []),
      ...(europe.status === 'fulfilled' ? europe.value : []),
    ]

    // Deduplicate by symbol+exchange
    const seen = new Set()
    const unique = stocks.filter(s => {
      const key = `${s.exchange}:${s.symbol}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Cache for 1 hour on Vercel's CDN — saves API quota
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600')
    return res.status(200).json({ stocks: unique, updatedAt: new Date().toISOString() })

  } catch (err) {
    console.error('FMP fetch error:', err)
    return res.status(500).json({ error: err.message })
  }
}
