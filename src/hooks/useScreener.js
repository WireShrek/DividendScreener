import { useState, useMemo } from 'react'
import { STOCKS } from '../data/stocks'

const DEFAULTS = {
  search: '',
  exchange: 'ALL',
  yieldMin: '',
  yieldMax: '',
  sector: '',
  divMin: '',
  sortCol: 'dividendYield',
  sortDir: 'desc',
  page: 1,
}

export const PER_PAGE = 14

export function useScreener() {
  const [search, setSearch]     = useState(DEFAULTS.search)
  const [exchange, setExchange] = useState(DEFAULTS.exchange)
  const [yieldMin, setYieldMin] = useState(DEFAULTS.yieldMin)
  const [yieldMax, setYieldMax] = useState(DEFAULTS.yieldMax)
  const [sector, setSector]     = useState(DEFAULTS.sector)
  const [divMin, setDivMin]     = useState(DEFAULTS.divMin)
  const [sortCol, setSortCol]   = useState(DEFAULTS.sortCol)
  const [sortDir, setSortDir]   = useState(DEFAULTS.sortDir)
  const [page, setPage]         = useState(DEFAULTS.page)

  const filtered = useMemo(() => {
    let data = [...STOCKS]

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
  }, [search, exchange, yieldMin, yieldMax, sector, divMin, sortCol, sortDir])

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

  function handleExchange(ex) { setExchange(ex); setPage(1) }
  function handleSearch(v)    { setSearch(v);    setPage(1) }

  const activeFilters = [
    yieldMin !== '' && { label: `Yield ≥ ${yieldMin}%`, clear: () => setYieldMin('') },
    yieldMax !== '' && { label: `Yield ≤ ${yieldMax}%`, clear: () => setYieldMax('') },
    sector          && { label: sector,                  clear: () => setSector('') },
    divMin !== ''   && { label: `Div ≥ $${divMin}`,      clear: () => setDivMin('') },
  ].filter(Boolean)

  return {
    // state
    search, exchange, yieldMin, yieldMax, sector, divMin,
    sortCol, sortDir, page: safePage, totalPages,
    // derived
    pageData, filtered, kpis, activeFilters,
    // setters
    setSearch: handleSearch,
    setExchange: handleExchange,
    setYieldMin: v => { setYieldMin(v); setPage(1) },
    setYieldMax: v => { setYieldMax(v); setPage(1) },
    setSector:   v => { setSector(v);   setPage(1) },
    setDivMin:   v => { setDivMin(v);   setPage(1) },
    handleSort,
    setPage,
  }
}
