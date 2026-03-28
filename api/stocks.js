const FMP_BASE = 'https://financialmodelingprep.com/api/v3'

// ~300 curated dividend stocks matching DividendMax coverage
const SYMBOLS = [
  // ── NASDAQ ────────────────────────────────────────────────────
  'AAPL','MSFT','AVGO','INTC','CSCO','QCOM','TXN','ADI','KLAC',
  'PAYX','ADP','FAST','SBUX','MDLZ','WBA','AMGN','GILD','TROW',
  'CINF','FITB','HBAN','NTRS','CTAS','POOL','KHC','WBA','SIRI',

  // ── NYSE / S&P 500 ────────────────────────────────────────────
  // Dividend Aristocrats
  'KO','PG','JNJ','MMM','ABT','AFL','APD','ATO','BDX','BEN',
  'CAH','CAT','CB','CL','CLX','CVX','DOV','ECL','EMR','GPC',
  'GWW','HRL','IBM','ITW','KMB','LEG','LOW','MCD','MDT','MKC',
  'NUE','PEP','PKG','PNR','PPG','ROP','SHW','SPGI','SWK','SYY',
  'T','TGT','WMT','XOM','VZ','MO','PM','ABBV','GIS','CAG',
  // Financials
  'JPM','BAC','WFC','GS','MS','C','USB','PNC','TFC','COF',
  // Healthcare
  'UNH','CVS','CI','HUM','ELV','PFE','ABBV','BMY','LLY','MRK',
  // Energy
  'XOM','CVX','COP','EOG','SLB','HAL','BKR','MPC','VLO','PSX',
  // Utilities
  'DUK','SO','D','ED','EXC','AEP','XEL','WEC','PPL','FE',
  'ETR','CMS','NI','AES','PEG','EIX','ES','CNP','EVRG','AWK',
  // REITs
  'O','NNN','WPC','STAG','PSA','EQR','AVB','PLD','DLR','AMT',
  'CCI','SBAC','SPG','VTR','WELL','KIM','REG','ARE','BXP','MPW',
  // Consumer
  'HD','LOW','TGT','COST','WMT','MCD','YUM','DRI','CMG','SBUX',
  'HSY','MKC','SJM','HRL','TSN','ADM','K','CPB','GIS','CAG',
  // Industrial
  'UPS','FDX','UNP','CSX','NSC','GE','HON','RTX','LMT','NOC',
  'GD','EMR','ETN','PH','ROK','AME','FTV','GNRC','IR','XYL',

  // ── LSE (London Stock Exchange) ────────────────────────────────
  'HSBA.L','BP.L','SHEL.L','VOD.L','LLOY.L','GLEN.L','AZN.L',
  'DGE.L','RIO.L','BATS.L','IMB.L','LGEN.L','PHNX.L','ULVR.L',
  'NG.L','SSE.L','SVT.L','UU.L','TSCO.L','SBRY.L','MKS.L',
  'NXT.L','WPP.L','REL.L','GSK.L','BA.L','BBY.L','BNZL.L',
  'BKG.L','BLND.L','BRBY.L','CCH.L','CNA.L','CRH.L','DCC.L',
  'EXPN.L','FERG.L','FRES.L','HIK.L','HLMA.L','IAG.L','IHG.L',
  'ITRK.L','KGF.L','LAND.L','MNDI.L','MNG.L','NWG.L','RKT.L',
  'SGRO.L','SKG.L','SMDS.L','SMIN.L','SN.L','STAN.L','TW.L',
  'WTB.L','AUTO.L','AHT.L','CPG.L','BT-A.L','HWDN.L','III.L',
  'INF.L','JD.L','ADM.L','FOUR.L','AV.L','ABF.L','BME.L',

  // ── Europe ─────────────────────────────────────────────────────
  // France
  'AI.PA','AIR.PA','BN.PA','BNP.PA','CA.PA','CS.PA','DG.PA',
  'ENGI.PA','GLE.PA','HO.PA','MC.PA','OR.PA','ORA.PA','RI.PA',
  'SAF.PA','SGO.PA','SU.PA','TTE.PA','VIV.PA','ACA.PA','SAN.PA',
  // Germany
  'ALV.DE','BAS.DE','BAYN.DE','BMW.DE','DB1.DE','DBK.DE','DHL.DE',
  'DTE.DE','EOAN.DE','FME.DE','HEI.DE','HEN3.DE','IFX.DE','MRK.DE',
  'MUV2.DE','RWE.DE','SAP.DE','SIE.DE','VOW3.DE','CON.DE','LIN.DE',
  // Netherlands
  'ASML.AS','HEIA.AS','INGA.AS','NN.AS','PHIA.AS','RAND.AS','UNA.AS',
  // Italy
  'ENEL.MI','ENI.MI','G.MI','ISP.MI','UCG.MI','TIT.MI','STLA.MI',
  // Spain
  'BBVA.MC','SAN.MC','TEF.MC','IBE.MC','REP.MC','ITX.MC','ACS.MC',
  'ELE.MC','FER.MC','MAP.MC',
  // Switzerland
  'NESN.SW','NOVN.SW','ROG.SW','UBSG.SW','ZURN.SW',
]

async function fetchProfileBatch(symbols) {
  const apiKey = process.env.FMP_API_KEY
  const chunk = symbols.join(',')
  try {
    const res = await fetch(`${FMP_BASE}/profile/${chunk}?apikey=${apiKey}`)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function classifyExchange(p) {
  const sym = p.symbol || ''
  const ex  = (p.exchangeShortName || '').toUpperCase()
  if (sym.endsWith('.L'))  return 'LSE'
  if (['.PA','.DE','.AS','.MI','.MC','.SW'].some(s => sym.endsWith(s))) return 'EUROPE'
  if (ex === 'NASDAQ')     return 'NASDAQ'
  if (['EURONEXT','ETR','BIT','EPA','SWX','SIX'].includes(ex)) return 'EUROPE'
  if (ex === 'LSE')        return 'LSE'
  return 'NYSE'
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  if (!process.env.FMP_API_KEY) {
    return res.status(500).json({ error: 'FMP_API_KEY not configured' })
  }

  try {
    const profiles = []
    const chunkSize = 50

    for (let i = 0; i < SYMBOLS.length; i += chunkSize) {
      const batch = await fetchProfileBatch(SYMBOLS.slice(i, i + chunkSize))
      profiles.push(...batch)
    }

    const stocks = profiles
      .filter(p => p.symbol && p.price && p.companyName)
      .map(p => {
        const price = p.price ?? null
        const div   = p.lastDiv ?? null
        const yld   = price && div && div > 0 ? (div / price) * 100 : null
        return {
          symbol:           p.symbol,
          name:             p.companyName,
          exchange:         classifyExchange(p),
          price:            price ? +price.toFixed(2)  : null,
          dividendPerShare: div && div > 0 ? +div.toFixed(4) : null,
          dividendYield:    yld  ? +yld.toFixed(2)    : null,
          currency:         p.currency ?? 'USD',
          sector:           p.sector   ?? null,
          mktCap:           p.mktCap   ?? null,
        }
      })
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
