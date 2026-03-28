const FMP_BASE = 'https://financialmodelingprep.com/stable'

// ~250 curated dividend stocks across NASDAQ, NYSE, LSE and Europe
const SYMBOLS = [
  // ── NASDAQ ─────────────────────────────────────────────────────────
  'AAPL','MSFT','AVGO','INTC','CSCO','QCOM','TXN','ADI','PAYX','ADP',
  'FAST','SBUX','MDLZ','WBA','AMGN','GILD','TROW','CINF','FITB','HBAN',
  'NTRS','CTAS','KHC','SIRI','KLAC','MCHP','NDSN','EXPD','CHRW','CTSH',

  // ── NYSE / S&P 500 ──────────────────────────────────────────────────
  // Dividend Aristocrats
  'KO','PG','JNJ','MMM','ABT','AFL','APD','ATO','BDX','BEN',
  'CAH','CAT','CB','CL','CLX','CVX','DOV','ECL','EMR','GPC',
  'GWW','HRL','IBM','ITW','KMB','LEG','LOW','MCD','MDT','MKC',
  'NUE','PEP','PPG','ROP','SHW','SPGI','SWK','SYY','TGT','WMT',
  // High yield / income
  'T','VZ','MO','PM','ABBV','XOM','CVS','PFE','BAC','WFC',
  'JPM','GS','C','USB','PNC','O','NNN','WPC','STAG','PSA',
  // Utilities
  'DUK','SO','D','ED','EXC','AEP','XEL','WEC','PPL','FE',
  'ETR','CMS','AES','PEG','AWK','ES','CNP','EVRG','NI','EIX',
  // REITs
  'EQR','AVB','PLD','DLR','AMT','CCI','SBAC','SPG','VTR','WELL',
  'KIM','REG','ARE','BXP','MPW','EPR','SRC','COLD','CUBE','LSI',
  // Consumer / Healthcare / Industrial
  'HD','UPS','FDX','UNP','CSX','HON','RTX','LMT','NOC','GD',
  'GIS','CAG','K','CPB','HSY','SJM','TSN','ADM','UNH','ELV',
  'HUM','CI','BMY','LLY','MRK','ABBV','AMGN','ZBH','BSX','EW',

  // ── LSE ────────────────────────────────────────────────────────────
  'HSBA.L','BP.L','SHEL.L','VOD.L','LLOY.L','GLEN.L','AZN.L',
  'DGE.L','RIO.L','BATS.L','IMB.L','LGEN.L','PHNX.L','ULVR.L',
  'NG.L','SSE.L','SVT.L','UU.L','TSCO.L','SBRY.L','MKS.L',
  'NXT.L','WPP.L','REL.L','GSK.L','BA.L','BNZL.L','BKG.L',
  'BLND.L','BRBY.L','CCH.L','CNA.L','CRH.L','EXPN.L','FERG.L',
  'FRES.L','HLMA.L','IAG.L','IHG.L','ITRK.L','KGF.L','LAND.L',
  'MNDI.L','MNG.L','NWG.L','RKT.L','SGRO.L','SMIN.L','SN.L',
  'STAN.L','TW.L','WTB.L','AHT.L','AV.L','ABF.L','III.L',
  'BT-A.L','ADM.L','FOUR.L','BME.L','AUTO.L','CPG.L','HIK.L',

  // ── Europe ─────────────────────────────────────────────────────────
  // France
  'AI.PA','AIR.PA','BN.PA','BNP.PA','CS.PA','DG.PA','ENGI.PA',
  'GLE.PA','MC.PA','OR.PA','ORA.PA','RI.PA','SAF.PA','SGO.PA',
  'SU.PA','TTE.PA','VIV.PA','ACA.PA','HO.PA',
  // Germany
  'ALV.DE','BAS.DE','BAYN.DE','BMW.DE','DBK.DE','DHL.DE','DTE.DE',
  'EOAN.DE','HEN3.DE','IFX.DE','MRK.DE','MUV2.DE','RWE.DE','SAP.DE',
  'SIE.DE','VOW3.DE','LIN.DE','CON.DE','FME.DE','HEI.DE',
  // Netherlands
  'ASML.AS','HEIA.AS','INGA.AS','NN.AS','PHIA.AS','UNA.AS','RAND.AS',
  // Italy
  'ENEL.MI','ENI.MI','G.MI','ISP.MI','UCG.MI','TIT.MI',
  // Spain
  'BBVA.MC','SAN.MC','TEF.MC','IBE.MC','REP.MC','ITX.MC','ELE.MC',
  // Switzerland
  'NESN.SW','NOVN.SW','ROG.SW','UBSG.SW','ZURN.SW',
]

// Fetch quotes in batches of 50 (free tier supports multi-symbol quote)
async function fetchQuotes(symbols, apiKey) {
  const quotes = {}
  const chunkSize = 50
  for (let i = 0; i < symbols.length; i += chunkSize) {
    const chunk = symbols.slice(i, i + chunkSize).join(',')
    try {
      const r = await fetch(`${FMP_BASE}/quote?symbol=${chunk}&apikey=${apiKey}`)
      if (!r.ok) continue
      const data = await r.json()
      if (Array.isArray(data)) {
        for (const q of data) quotes[q.symbol] = q
      }
    } catch { continue }
  }
  return quotes
}

// Fetch dividend calendar for next 90 days to get yields + ex-dates
async function fetchDividends(apiKey) {
  const today = new Date()
  const future = new Date(today)
  future.setDate(future.getDate() + 90)
  const from = today.toISOString().slice(0, 10)
  const to   = future.toISOString().slice(0, 10)

  try {
    const r = await fetch(`${FMP_BASE}/dividends-calendar?from=${from}&to=${to}&apikey=${apiKey}`)
    if (!r.ok) return {}
    const data = await r.json()
    if (!Array.isArray(data)) return {}

    // Index by symbol — keep latest entry per symbol
    const divMap = {}
    for (const d of data) {
      if (!divMap[d.symbol] || new Date(d.date) > new Date(divMap[d.symbol].date)) {
        divMap[d.symbol] = d
      }
    }
    return divMap
  } catch { return {} }
}

function classifyExchange(symbol, exchangeFromApi) {
  const ex = (exchangeFromApi || '').toUpperCase()
  if (symbol.endsWith('.L'))  return 'LSE'
  if (['.PA','.DE','.AS','.MI','.MC','.SW'].some(s => symbol.endsWith(s))) return 'EUROPE'
  if (ex === 'NASDAQ')        return 'NASDAQ'
  if (['EURONEXT','ETR','BIT','EPA','SWX','SIX'].includes(ex)) return 'EUROPE'
  if (ex === 'LSE')           return 'LSE'
  return 'NYSE'
}

function getCurrency(symbol, exchangeFromApi) {
  if (symbol.endsWith('.L'))   return 'GBP'
  if (symbol.endsWith('.SW'))  return 'CHF'
  if (['.PA','.DE','.AS','.MI','.MC'].some(s => symbol.endsWith(s))) return 'EUR'
  return 'USD'
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  if (!process.env.FMP_API_KEY) {
    return res.status(500).json({ error: 'FMP_API_KEY not configured' })
  }

  const apiKey = process.env.FMP_API_KEY

  try {
    // Fetch quotes and dividends in parallel
    const [quotes, divMap] = await Promise.all([
      fetchQuotes(SYMBOLS, apiKey),
      fetchDividends(apiKey),
    ])

    const stocks = SYMBOLS
      .map(symbol => {
        const q = quotes[symbol]
        const d = divMap[symbol]
        if (!q || !q.price) return null

        const price = q.price
        const dividendPerShare = d?.dividend ?? d?.adjDividend ?? null
        const dividendYield    = d?.yield
          ? +d.yield.toFixed(2)
          : (price && dividendPerShare ? +((dividendPerShare / price) * 100).toFixed(2) : null)

        return {
          symbol,
          name:             q.name ?? symbol,
          exchange:         classifyExchange(symbol, q.exchange),
          price:            +price.toFixed(2),
          dividendPerShare: dividendPerShare ? +dividendPerShare.toFixed(4) : null,
          dividendYield:    dividendYield || null,
          currency:         getCurrency(symbol, q.exchange),
          sector:           null, // not available on free quote endpoint
          // Calendar fields
          exDate:           d?.date        ?? null,
          payDate:          d?.paymentDate ?? null,
          declarationDate:  d?.declarationDate ?? null,
        }
      })
      .filter(Boolean)
      .filter((s, i, arr) => arr.findIndex(x => x.symbol === s.symbol) === i)
      .sort((a, b) => (b.dividendYield || 0) - (a.dividendYield || 0))

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
