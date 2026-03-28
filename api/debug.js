const FMP_BASE = 'https://financialmodelingprep.com/stable'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const apiKey = process.env.FMP_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'No API key' })
  const results = {}

  try {
    const r = await fetch(`${FMP_BASE}/quote?symbol=AAPL&apikey=${apiKey}`)
    const text = await r.text()
    results.single_quote = { status: r.status, body: text.slice(0, 300) }
  } catch (e) { results.single_quote = { error: e.message } }

  try {
    const r = await fetch(`${FMP_BASE}/quote?symbol=AAPL,MSFT,KO&apikey=${apiKey}`)
    const text = await r.text()
    results.batch_quote_3 = { status: r.status, body: text.slice(0, 300) }
  } catch (e) { results.batch_quote_3 = { error: e.message } }

  try {
    const r = await fetch(`${FMP_BASE}/quote/AAPL,MSFT,KO?apikey=${apiKey}`)
    const text = await r.text()
    results.batch_quote_path = { status: r.status, body: text.slice(0, 300) }
  } catch (e) { results.batch_quote_path = { error: e.message } }

  try {
    const r = await fetch(`${FMP_BASE}/quote?symbol=HSBA.L&apikey=${apiKey}`)
    const text = await r.text()
    results.lse_quote = { status: r.status, body: text.slice(0, 300) }
  } catch (e) { results.lse_quote = { error: e.message } }

  return res.status(200).json(results)
}