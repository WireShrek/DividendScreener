import React, { useState } from 'react'
import { EXCHANGES, SECTORS } from '../data/stocks'
import styles from './FilterBar.module.css'

export function FilterBar({
  search, onSearch,
  exchange, onExchange,
  yieldMin, onYieldMin,
  yieldMax, onYieldMax,
  sector, onSector,
  divMin, onDivMin,
  activeFilters,
}) {
  const [advOpen, setAdvOpen] = useState(false)

  return (
    <div className={styles.wrap}>
      {/* Row 1: search + exchange tabs + filter toggle */}
      <div className={styles.row1}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIco}>⌕</span>
          <input
            className={styles.searchInp}
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Ticker or company…"
          />
        </div>

        <div className={styles.exTabs}>
          {EXCHANGES.map(ex => (
            <button
              key={ex}
              className={`${styles.exTab} ${exchange === ex ? styles.active : ''}`}
              onClick={() => onExchange(ex)}
            >
              {ex === 'SP500' ? 'S&P 500' : ex === 'ALL' ? 'All' : ex}
            </button>
          ))}
        </div>

        <button
          className={`${styles.advBtn} ${advOpen ? styles.advOn : ''}`}
          onClick={() => setAdvOpen(v => !v)}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="2" y1="4"  x2="14" y2="4"/>
            <line x1="4" y1="8"  x2="12" y2="8"/>
            <line x1="6" y1="12" x2="10" y2="12"/>
          </svg>
          Filters
          {activeFilters.length > 0 && (
            <span className={styles.badge}>{activeFilters.length}</span>
          )}
        </button>
      </div>

      {/* Row 2: advanced filters */}
      {advOpen && (
        <div className={styles.advPanel}>
          <div className={styles.fg}>
            <label>Min Yield %</label>
            <input type="number" value={yieldMin} onChange={e => onYieldMin(e.target.value)}
              placeholder="e.g. 2.0" step="0.5" min="0" />
          </div>
          <div className={styles.fg}>
            <label>Max Yield %</label>
            <input type="number" value={yieldMax} onChange={e => onYieldMax(e.target.value)}
              placeholder="e.g. 12.0" step="0.5" min="0" />
          </div>
          <div className={styles.fg}>
            <label>Sector</label>
            <select value={sector} onChange={e => onSector(e.target.value)}>
              <option value="">All Sectors</option>
              {SECTORS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className={styles.fg}>
            <label>Min Div / Share</label>
            <input type="number" value={divMin} onChange={e => onDivMin(e.target.value)}
              placeholder="e.g. 1.00" step="0.1" min="0" />
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className={styles.chips}>
          {activeFilters.map((f, i) => (
            <div key={i} className={styles.chip}>
              {f.label}
              <span className={styles.chipX} onClick={f.clear}>×</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
