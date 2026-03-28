import React, { useState, useMemo } from 'react'
import { STOCKS } from '../data/stocks'
import { formatPrice, exchangeBadgeClass, MONTHS, DAYS } from '../utils/format'
import styles from './Calendar.module.css'

function buildEvents(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const eligible = STOCKS.filter(s => s.dividendYield > 0)
  const events = []

  eligible.forEach((s, i) => {
    const exDay  = ((i * 6 + 2) % (daysInMonth - 2)) + 1
    const payDay = Math.min(exDay + 14, daysInMonth)
    events.push({ type: 'ex',  date: new Date(year, month, exDay),  stock: s })
    events.push({ type: 'pay', date: new Date(year, month, payDay), stock: s })
  })

  return events.sort((a, b) => a.date - b.date)
}

export function Calendar() {
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

  const events = useMemo(() => buildEvents(calY, calM), [calY, calM])

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
      {/* Header */}
      <div className={styles.head}>
        <div>
          <h2>Dividend Calendar</h2>
          <p>Upcoming ex-dates &amp; payment dates, sorted chronologically</p>
        </div>
        <div className={styles.monthCtrl}>
          <button onClick={() => shiftMonth(-1)}>‹</button>
          <span>{MONTHS[calM]} {calY}</span>
          <button onClick={() => shiftMonth(1)}>›</button>
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.kpis}>
        <div className={styles.kpi}>
          <div className={`${styles.val} ${styles.amber}`}>{exEvents.length}</div>
          <div className={styles.lbl}>Ex-dates this month</div>
        </div>
        <div className={styles.kpi}>
          <div className={`${styles.val} ${styles.green}`}>${usdIncome.toFixed(2)}</div>
          <div className={styles.lbl}>Total USD div / share</div>
        </div>
        <div className={styles.kpi}>
          <div className={styles.val}>
            {nextEx
              ? `${nextEx.date.getDate()} ${MONTHS[nextEx.date.getMonth()].slice(0, 3)}`
              : '—'}
          </div>
          <div className={styles.lbl}>Next ex-date</div>
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legItem}><div className={`${styles.legDot} ${styles.ex}`} /> Ex-dividend date</div>
        <div className={styles.legItem}><div className={`${styles.legDot} ${styles.pay}`} /> Payment date</div>
      </div>

      {/* Timeline */}
      <div className={styles.timeline}>
        {days.length === 0 ? (
          <div className={styles.empty}>No events this month.</div>
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
                          <span>{s.dividendYield ? s.dividendYield.toFixed(2) + '% yield' : '—'}</span>
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
    </div>
  )
}
