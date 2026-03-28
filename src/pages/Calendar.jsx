import React, { useState, useMemo } from 'react'
import { formatPrice, exchangeBadgeClass, MONTHS, DAYS } from '../utils/format'
import styles from './Calendar.module.css'

export function Calendar({ stocks = [], loading = false }) {
  const today = new Date()
  const [calM, setCalM] = useState(today.getMonth())
  const [calY, setCalY] = useState(today.getFullYear())

  function shiftMonth(d) {
    setCalM(m => {
      const next = m + d
      if (next > 11) { setCalY(y => y + 1); return 0 }
      if (next < 0)  { setCalY(y => y - 1); return 11 }
      return next
    })
  }

  // Build events from real API data
  const events = useMemo(() => {
    const evts = []
    for (const s of stocks) {
      if (s.exDate) {
        const d = new Date(s.exDate)
        if (d.getMonth() === calM && d.getFullYear() === calY) {
          evts.push({ type: 'ex', date: d, stock: s })
        }
      }
      if (s.payDate) {
        const d = new Date(s.payDate)
        if (d.getMonth() === calM && d.getFullYear() === calY) {
          evts.push({ type: 'pay', date: d, stock: s })
        }
      }
    }
    return evts.sort((a, b) => a.date - b.date)
  }, [stocks, calM, calY])

  const exEvents  = events.filter(e => e.type === 'ex')
  const usdIncome = exEvents.reduce(
    (a, e) => e.stock.currency === 'USD' ? a + (e.stock.dividendPerShare || 0) : a, 0
  )
  const nextEx = exEvents.find(e => e.date >= today)

  // Group by day
  const byDay = {}
  events.forEach(e => {
    const k = e.date.toDateString()
    if (!byDay[k]) byDay[k] = { date: e.date, events: [] }
    byDay[k].events.push(e)
  })
  const days = Object.values(byDay).sort((a, b) => a.date - b.date)

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <h2>Dividend Calendar</h2>
          <p>Real ex-dividend &amp; payment dates from live market data</p>
        </div>
        <div className={styles.monthCtrl}>
          <button onClick={() => shiftMonth(-1)}>‹</button>
          <span>{MONTHS[calM]} {calY}</span>
          <button onClick={() => shiftMonth(1)}>›</button>
        </div>
      </div>

      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <div className={`${styles.val} ${styles.amber}`}>
            {loading ? '…' : exEvents.length}
          </div>
          <div className={styles.lbl}>Ex-dates this month</div>
        </div>
        <div className={styles.kpi}>
          <div className={`${styles.val} ${styles.green}`}>
            {loading ? '…' : '$' + usdIncome.toFixed(2)}
          </div>
          <div className={styles.lbl}>Total USD div / share</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.val}>
            {loading ? '…' : nextEx
              ? `${nextEx.date.getDate()} ${MONTHS[nextEx.date.getMonth()].slice(0, 3)}`
              : '—'}
          </div>
          <div className={styles.lbl}>Next ex-date</div>
        </div>
      </div>

      <div className={styles.legend}>
        <div className={styles.legItem}><div className={`${styles.legDot} ${styles.ex}`} /> Ex-dividend date</div>
        <div className={styles.legItem}><div className={`${styles.legDot} ${styles.pay}`} /> Payment date</div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading calendar data…</p>
        </div>
      ) : (
        <div className={styles.timeline}>
          {days.length === 0 ? (
            <div className={styles.empty}>
              No dividend events found for {MONTHS[calM]} {calY}.<br />
              <span>Try navigating to a different month.</span>
            </div>
          ) : (
            days.map(day => {
              const isToday = day.date.toDateString() === today.toDateString()
              return (
                <div key={day.date.toDateString()} className={styles.tlDay}>
                  <div className={`${styles.tlDate} ${isToday ? styles.today : ''}`}>
                    <div className={styles.dn}>{day.date.getDate()}</div>
                    <div className={styles.dy}>{DAYS[day.date.getDay()]}</div>
                  </div>
                  <div className={styles.tlLine} />
                  <div className={styles.tlEvents}>
                    {day.events.map((e, i) => {
                      const s = e.stock
                      const isEx = e.type === 'ex'
                      const exCls = exchangeBadgeClass(s.exchange)
                      return (
                        <div key={i} className={`${styles.tlEvent} ${isEx ? styles.evEx : styles.evPay}`}>
                          <span className={styles.sym}>{s.symbol}</span>
                          <span className={styles.co}>{s.name}</span>
                          <span className={`${styles.badge} ${styles[exCls]}`}>{s.exchange}</span>
                          <span className={`${styles.typeBadge} ${isEx ? styles.typeEx : styles.typePay}`}>
                            {isEx ? 'Ex-Date' : 'Pay Date'}
                          </span>
                          <div className={styles.amt}>
                            {s.dividendPerShare ? formatPrice(s.dividendPerShare, s.currency) : '—'}
                            <span>{s.dividendYield ? s.dividendYield.toFixed(2) + '% yield' : ''}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
