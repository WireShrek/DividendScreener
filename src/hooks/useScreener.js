import { useState, useMemo } from 'react'

export const PER_PAGE = 14

export function useScreener(allStocks = []) {
  const [search, setSearch]     = useState('')
  const [exchange, setExchange] = useState('ALL')
  const [yieldMin, setYieldMin] = useState('')
  const [yieldMax, setYieldMax] = useState('')
  const [sector, setSector]     = useState('')
  const [divMin, setDivMin]     = useState('')
  const [sortCol, setSortCol]   = useState('dividendYield')
  const [sortDir, setSortDir]   = useState('desc')
  const [page, setPage]         = useState(1)

  const filtered = useMemo(() => {
    let data = [...allStocks]

    if (exchange !== 'ALL') data = data.filter(s => s.exchange === exchange)
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(s =>
        s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      )
    }
    if (yieldMin !== '') data = data.filter(s => (s.dividendYield || 0) >= parseFloat(yieldMin))
    if (yieldMax !== '') data = data.filter(s => (s.dividendYield || 0) <= parseFloat(yieldMax))
    if (sector)          data = data.filter(s => s.sector === sector)
    if (divMin !== '')   data = data.filter(s => (s.dividendPerShare || 0) >= parseFloat(divMin))

    data.sort((a, b) => {
      let av = a[sortCol] ?? -Infinity
      let bv = b[sortCol] ?? -Infinity
      if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase() }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return data
  }, [allStocks, search, exchange, yieldMin, yieldMax, sector, divMin, sortCol, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage   = Math.min(page, totalPages)
  const pageData   = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const kpis = useMemo(() => {
    const withYield = filtered.filter(s => s.dividendYield > 0)
    return {
      count:    filtered.length,
      avgYield: withYield.length
        ? (withYield.reduce((a, s) => a + s.dividendYield, 0) / withYield.length).toFixed(2) + '%'
        : '—',
      maxYield: filtered.length
        ? Math.max(...filtered.map(s => s.dividendYield || 0)).toFixed(2) + '%'
        : '—',
    }
  }, [filtered])

  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
    setPage(1)
  }

  const activeFilters = [
    yieldMin !== '' && { label: `Yield ≥ ${yieldMin}%`, clear: () => setYieldMin('') },
    yieldMax !== '' && { label: `Yield ≤ ${yieldMax}%`, clear: () => setYieldMax('') },
    sector          && { label: sector,                  clear: () => setSector('') },
    divMin !== ''   && { label: `Div ≥ $${divMin}`,      clear: () => setDivMin('') },
  ].filter(Boolean)

  return {
    search, exchange, yieldMin, yieldMax, sector, divMin,
    sortCol, sortDir, page: safePage, totalPages,
    pageData, filtered, kpis, activeFilters,
    setSearch:   v => { setSearch(v);   setPage(1) },
    setExchange: v => { setExchange(v); setPage(1) },
    setYieldMin: v => { setYieldMin(v); setPage(1) },
    setYieldMax: v => { setYieldMax(v); setPage(1) },
    setSector:   v => { setSector(v);   setPage(1) },
    setDivMin:   v => { setDivMin(v);   setPage(1) },
    handleSort,
    setPage,
  }
}
