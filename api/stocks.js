const FMP_BASE = 'https://financialmodelingprep.com/stable'

const SYMBOLS = [
  // S&P 500 / NYSE — Dividend Aristocrats + High Yield
  'KO','PG','JNJ','MMM','ABT','AFL','APD','ATO','BDX','BEN',
  'CAH','CAT','CB','CL','CLX','CVX','DOV','ECL','EMR','GPC',
  'GWW','HRL','IBM','ITW','KMB','LEG','LOW','MCD','MDT','MKC',
  'NUE','PEP','PPG','ROP','SHW','SPGI','SWK','SYY','TGT','WMT',
  'T','VZ','MO','PM','ABBV','XOM','CVS','PFE','BAC','WFC',
  'JPM','GS','C','USB','PNC','O','NNN','WPC','STAG','PSA',
  'DUK','SO','D','ED','EXC','AEP','XEL','WEC','PPL','FE',
  'ETR','CMS','AES','PEG','AWK','ES','CNP','NI','EIX','EVRG',
  'EQR','AVB','PLD','DLR','AMT','CCI','SPG','VTR','WELL','KIM',
  'HD','UPS','UNP','CSX','HON','RTX','LMT','NOC','GD','EMR',
  'GIS','CAG','K','CPB','HSY','SJM','TSN','ADM','HRL','MKC',
  'UNH','ELV','HUM','CI','BMY','LLY','MRK','AMGN','GILD','ABBV',
  // NASDAQ
  'AAPL','MSFT','AVGO','INTC','CSCO','QCOM','TXN','ADI','PAYX','ADP',
  'FAST','SBUX','MDLZ','WBA','TROW','CINF','FITB','NTRS','CTAS','KHC',
  // LSE — FTSE 100 dividend payers
  'HSBA.L','BP.L','SHEL.L','VOD.L','LLOY.L','GLEN.L','AZN.L',
  'DGE.L','RIO.L','BATS.L','IMB.L','LGEN.L','PHNX.L','ULVR.L',
  'NG.L','SSE.L','SVT.L','UU.L','TSCO.L','SBRY.L','MKS.L',
  'NXT.L','WPP.L','REL.L','GSK.L','BA.L','BNZL.L','BKG.L',
  'BLND.L','BRBY.L','CCH.L','CNA.L','CRH.L','EXPN.L','FERG.L',
  'FRES.L','HLMA.L','IAG.L','IHG.L','ITRK.L','KGF.L','LAND.L',
  'MNDI.L','MNG.L','NWG.L','RKT.L','SGRO.L','SMIN.L','SN.L',
  'STAN.L','TW.L','WTB.L','AHT.L','AV.L','ABF.L','III.L',
  'BT-A.L','ADM.L','BME.L','AUTO.L','CPG.L','HIK.L','INF.L',
  // Europe — DAX, CAC 40, AEX, MIB, IBEX, SMI
  'AI.PA','AIR.PA','BN.PA','BNP.PA','CS.PA','DG.PA','ENGI.PA',
  'GLE.PA','MC.PA','OR.PA','ORA.PA','RI.PA','SAF.PA','SGO.PA',
  'SU.PA','TTE.PA','VIV.PA','ACA.PA','HO.PA','SAN.PA',
  'ALV.DE','BAS.DE','BAYN.DE','BMW.DE','DBK.DE','DHL.DE','DTE.DE',
  'EOAN.DE','HEN3.DE','IFX.DE','MRK.DE','MUV2.DE','RWE.DE','SAP.DE',
  'SIE.DE','VOW3.DE','LIN.DE','CON.DE','FME.DE','HEI.DE',
  'ASML.AS','HEIA.AS','INGA.AS','NN.AS','PHIA.AS','UNA.AS',
  'ENEL.MI','ENI.MI','G.MI','ISP.MI','UCG.MI','TIT.MI',
  'BBVA.MC','SAN.MC','TEF.MC','IBE.MC','REP.MC','ITX.MC','ELE.MC',
  'NESN.SW','NOVN.SW','ROG.SW','UBSG.SW','ZURN.SW',
]

const CONCURRENCY = 5

async function fetchQuote(symbol, apiKey) {
  try {
    const r = await fetch(`${FMP_BASE}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`)
    if (!r.ok) return null
    const data = await r.json()
    return Array.isArray(data) && data[0] ? data[0] : null
  } catch { return null }
}

async function fetchInBatches(symbols, apiKey) {
  const results = []
  for (let i = 0; i < symbols.length; i += CONCURRENCY) {
    const chunk = symbols.slice(i, i + CONCURRENCY)
    const settled = await Promise.allSettled(chunk.map(s => fetchQuote(s, apiKey)))
    for (let j = 0; j < settled.length; j++) {
      if (settled[j].status === 'fulfilled' && settled[j].value) {
        results.push({ symbol: chunk[j], quote: settled[j].value })
      }
    }
    if (i + CONCURRENCY < symbols.length) {
      await new Promise(r => setTimeout(r, 120))
    }
  }
  return results
}

async function fetchDividendCalendar(apiKey) {
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
    const map = {}
    for (const d of data) {
      if (!map[d.symbol] || new Date(d.date) > new Date(map[d.symbol].date)) {
        map[d.symbol] = d
      }
    }
    return map
  } catch { return {} }
}

function classifyExchange(symbol, apiExchange) {
  const ex = (apiExchange || '').toUpperCase()
  if (symbol.endsWith('.L'))  return 'LSE'
  if (['.PA','.DE','.AS','.MI','.MC','.SW'].some(s => symbol.endsWith(s))) return 'EUROPE'
  if (ex === 'NASDAQ') return 'NASDAQ'
  if (['EURONEXT','ETR','BIT','EPA','SWX','SIX'].includes(ex)) return 'EUROPE'
  if (ex === 'LSE')    return 'LSE'
  return 'NYSE'
}

function getCurrency(symbol) {
  if (symbol.endsWith('.L'))  return 'GBP'
  if (symbol.endsWith('.SW')) return 'CHF'
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
    const [quoteResults, divMap] = await Promise.all([
      fetchInBatches(SYMBOLS, apiKey),
      fetchDividendCalendar(apiKey),
    ])

    const stocks = quoteResults
      .map(({ symbol, quote: q }) => {
        const d = divMap[symbol]
        const price = q.price ?? null
        const dividendPerShare = d?.dividend ?? d?.adjDividend ?? null
        const dividendYield = d?.yield
          ? +Number(d.yield).toFixed(2)
          : (price && dividendPerShare ? +((dividendPerShare / price) * 100).toFixed(2) : null)
        return {
          symbol,
          name:             q.name ?? symbol,
          exchange:         classifyExchange(symbol, q.exchange),
          price:            price ? +Number(price).toFixed(2) : null,
          dividendPerShare: dividendPerShare ? +Number(dividendPerShare).toFixed(4) : null,
          dividendYield:    dividendYield || null,
          currency:         getCurrency(symbol),
          sector:           null,
          exDate:           d?.date            ?? null,
          payDate:          d?.paymentDate     ?? null,
          declarationDate:  d?.declarationDate ?? null,
        }
      })
      .filter(s => s.price)
      .sort((a, b) => (b.dividendYield || 0) - (a.dividendYield || 0))

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600')
    return res.status(200).json({
      stocks,
      updatedAt: new Date().toISOString(),
      count: stocks.length,
    })

  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}