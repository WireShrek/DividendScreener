import React from 'react'
import { formatPrice, formatYield, yieldClass, exchangeBadgeClass } from '../utils/format'
import styles from './StockTable.module.css'

const COLS = [
  { key: 'symbol',           label: 'Symbol',      align: 'left' },
  { key: 'name',             label: 'Company',      align: 'left' },
  { key: 'exchange',         label: 'Exchange',     align: 'left',  noSort: true },
  { key: 'price',            label: 'Price',        align: 'right' },
  { key: 'dividendPerShare', label: 'Div / Share',  align: 'right' },
  { key: 'dividendYield',    label: 'Yield',        align: 'right' },
  { key: 'sector',           label: 'Sector',       align: 'left',  noSort: true },
]

export function StockTable({ data, sortCol, sortDir, onSort, page, totalPages, onPage, totalCount, pageStart, pageEnd }) {
  return (
    <div className={styles.outer}>
      <div className={styles.scrollWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {COLS.map(col => (
                <th
                  key={col.key}
                  className={`
                    ${col.align === 'right' ? styles.r : ''}
                    ${!col.noSort ? styles.sortable : ''}
                    ${sortCol === col.key ? styles.sorted : ''}
                  `}
                  onClick={() => !col.noSort && onSort(col.key)}
                >
                  {col.label}
                  {!col.noSort && (
                    <span className={styles.sortIcon}>
                      {sortCol === col.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  No stocks match your filters.
                </td>
              </tr>
            ) : (
              data.map(s => {
                const yld = s.dividendYield || 0
                const yStr = formatYield(yld)
                const yCls = yieldClass(yld)
                return (
                  <tr key={`${s.symbol}-${s.exchange}`}>
                    <td><span className={styles.symbol}>{s.symbol}</span></td>
                    <td><span className={styles.coName} title={s.name}>{s.name}</span></td>
                    <td>
                      <span className={`${styles.badge} ${styles[exchangeBadgeClass(s.exchange)]}`}>
                        {s.exchange}
                      </span>
                    </td>
                    <td className={styles.r}>
                      <span className={styles.mono}>{formatPrice(s.price, s.currency)}</span>
                    </td>
                    <td className={styles.r}>
                      <span className={styles.mono}>
                        {s.dividendPerShare ? formatPrice(s.dividendPerShare, s.currency) : '—'}
                      </span>
                    </td>
                    <td className={styles.r}>
                      {yStr
                        ? <span className={`${styles.yieldPill} ${styles[yCls]}`}>{yStr}</span>
                        : <span className={styles.dim}>—</span>
                      }
                    </td>
                    <td><span className={styles.sector}>{s.sector || '—'}</span></td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div className={styles.footer}>
        <span className={styles.footerInfo}>
          {totalCount === 0
            ? '0 results'
            : `${pageStart}–${pageEnd} of ${totalCount.toLocaleString()}`}
        </span>
        <div className={styles.pagBtns}>
          <button className={styles.pagBtn} onClick={() => onPage(page - 1)} disabled={page <= 1}>
            ← Prev
          </button>
          <span className={styles.pagPages}>{page} / {totalPages}</span>
          <button className={styles.pagBtn} onClick={() => onPage(page + 1)} disabled={page >= totalPages}>
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
