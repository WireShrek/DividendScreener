import React from 'react'
import { useScreener, PER_PAGE } from '../hooks/useScreener'
import { FilterBar } from '../components/FilterBar'
import { StockTable } from '../components/StockTable'
import styles from './Screener.module.css'

export function Screener({ stocks = [], loading = false, error = null, updatedAt = null }) {
  const s = useScreener(stocks)

  const pageStart = (s.page - 1) * PER_PAGE + 1
  const pageEnd   = Math.min(s.page * PER_PAGE, s.filtered.length)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h1>Dividend Screener</h1>
          <p>
            Live yield data · NASDAQ · S&amp;P 500 · NYSE · LSE · Europe
            {updatedAt && (
              <span className={styles.updatedAt}>
                {' '}· Updated {new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <div className={styles.kpis}>
          <div className={styles.kpi}>
            <span className={`${styles.kpiVal} ${styles.blue}`}>
              {loading ? '…' : s.kpis.count.toLocaleString()}
            </span>
            <span className={styles.kpiLbl}>Stocks</span>
          </div>
          <div className={styles.kpi}>
            <span className={`${styles.kpiVal} ${styles.green}`}>
              {loading ? '…' : s.kpis.avgYield}
            </span>
            <span className={styles.kpiLbl}>Avg Yield</span>
          </div>
          <div className={styles.kpi}>
            <span className={styles.kpiVal}>
              {loading ? '…' : s.kpis.maxYield}
            </span>
            <span className={styles.kpiLbl}>Highest</span>
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          ⚠ Could not load live data: {error}
        </div>
      )}

      <FilterBar
        search={s.search}       onSearch={s.setSearch}
        exchange={s.exchange}   onExchange={s.setExchange}
        yieldMin={s.yieldMin}   onYieldMin={s.setYieldMin}
        yieldMax={s.yieldMax}   onYieldMax={s.setYieldMax}
        sector={s.sector}       onSector={s.setSector}
        divMin={s.divMin}       onDivMin={s.setDivMin}
        activeFilters={s.activeFilters}
      />

      {loading ? (
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>Fetching live market data…</p>
        </div>
      ) : (
        <StockTable
          data={s.pageData}
          sortCol={s.sortCol}
          sortDir={s.sortDir}
          onSort={s.handleSort}
          page={s.page}
          totalPages={s.totalPages}
          onPage={s.setPage}
          totalCount={s.filtered.length}
          pageStart={pageStart}
          pageEnd={pageEnd}
        />
      )}
    </div>
  )
}
