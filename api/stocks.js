const FMP_BASE = 'https://financialmodelingprep.com/api/v3'

// Curated list of well-known dividend stocks across all exchanges
// Profile endpoint is free tier — works for any symbol
const SYMBOLS = [
  // S&P 500 / NYSE — Dividend aristocrats & high yield
  'AAPL','MSFT','JPM','JNJ','KO','PG','XOM','CVX','T','VZ',
  'MO','PM','ABBV','D','DUK','GIS','O','NNN','MMM','CAT',
  'IBM','PFE','BAC','WFC','MCD','WMT','HD','LOW','TGT','COST',
  'UNP','UPS','EMR','APD','SHW','ECL','ITW','GPC','CINF','AFL',
  'BEN','LEG','PNR','AOS','MKC','CLX','SYY','HRL','CBZ','FRT',
  'ESS','AVB','PLD','PSA','EQR','SPG','VTR','WELL','DLR','AMT',
  'CCI','SBAC','EQIX','ARE','BXP','KIM','REG','WPC','NLY','AGNC',
  'WBA','INTC','CSCO','QCOM','TXN','ADI','PAYX','ADP','ED','SO',
  'EXC','AEP','XEL','WEC','PPL','FE','ETR','CMS','NI','OGE',
  'CVS','ABC','MCK','CAH','UHS','HCA','THC','OHI','LTC','SBRA',

  // LSE
  'HSBA.L','BP.L','SHEL.L','VOD.L','LLOY.L','GLEN.L','AZN.L',
  'DGE.L','RIO.L','BT.L','BATS.L','IMB.L','LGEN.L','PHNX.L',
  'ULVR.L','REL.L','NG.L','SSE.L','SVT.L','UU.L',

  // European
  'ASML','SAP','SAN','BNP.PA','ENGI.PA','ENEL.MI','ALV.DE',
  'BAYN.DE','AIR.PA','TTE.PA','OR.PA','SU.PA','AI.PA','BN.PA',
  'VIV.PA','ORA.PA','EDF.PA','STLA.MI','ENI.MI','G.MI',

  // NASDAQ
  'AVGO','WBA','AMGN','GILD','TROW','FAST','CHRW','EXPD','JBHT',
  'SBUX','MDLZ','MNST','DLTR','ROST','TJX','POOL','ODFL','CTAS',
]

async function fetchProfiles(symbols) {
  const apiKey = process.env.FMP_API_KEY
  const profiles = []
  const chunkSize = 50

  for (let i = 0; i < symbols.length; i += chunkSize) {
    const chunk = symbols.slice(i, i + chunkSize).join(',')
    try {
      const res = await fetch(`${FMP_BASE}/profile/${chunk}?apikey=${apiKey}`)
      if (!res.ok) continue
      const data = await res.json()
      if (Array.isArray(data)) profiles.push(...data)
    } catch (e) {
      // continue on batch errors
    }
  }
  return profiles
}

function mapExchange(exchangeShortName, symbol) {
  const ex = (exchangeShortName || '').toUpperCase()
  if (symbol.endsWith('.L'))  return 'LSE'
  if (ex === 'NASDAQ')        return 'NASDAQ'
  if (ex === 'NYSE')          return 'NYSE'
  if (['EURONEXT','ETR','BIT','EPA','EBR'].includes(ex)) return 'EUROPE'
  if (ex === 'LSE')           return 'LSE'
  return 'NYSE'
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  if (!process.env.FMP_API_KEY) {
    return res.status(500).json({ error: 'FMP_API_KEY not configured' })
  }

  try {
    const profiles = await fetchProfiles(SYMBOLS)

    const stocks = profiles
      .filter(p => p.symbol && p.price)
      .map(p => {
        const price = p.price ?? null
        const div   = p.lastDiv ?? null
        const yld   = price && div && div > 0 ? (div / price) * 100 : null
        return {
          symbol:           p.symbol,
          name:             p.companyName ?? p.symbol,
          exchange:         mapExchange(p.exchangeShortName, p.symbol),
          price:            price ? +price.toFixed(2) : null,
          dividendPerShare: div && div > 0 ? +div.toFixed(2) : null,
          dividendYield:    yld ? +yld.toFixed(2) : null,
          currency:         p.currency ?? 'USD',
          sector:           p.sector ?? null,
        }
      })
      // Deduplicate
      .filter((s, i, arr) => arr.findIndex(x => x.symbol === s.symbol) === i)

    // Cache 1 hour on Vercel CDN
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600')
    return res.status(200).json({
      stocks,
      updatedAt: new Date().toISOString(),
      count: stocks.length,
    })

  } catch (err) {
    console.error('FMP fetch error:', err)
    return res.status(500).json({ error: err.message })
  }
}
