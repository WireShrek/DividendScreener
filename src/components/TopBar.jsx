import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import styles from './TopBar.module.css'

export function TopBar({ updatedAt, onRefresh }) {
  const [refreshing, setRefreshing] = useState(false)

  function handleRefresh() {
    setRefreshing(true)
    onRefresh?.()
    setTimeout(() => setRefreshing(false), 1500)
  }

  const timeStr = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <header className={styles.topbar}>
      <div className={styles.logo}>
        <div className={styles.logoDot} />
        DIVSCREEN
      </div>

      <nav className={styles.tabs}>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="3" width="14" height="10" rx="1.5"/>
            <line x1="1" y1="6" x2="15" y2="6"/>
            <line x1="5" y1="6" x2="5" y2="13"/>
          </svg>
          Screener
        </NavLink>
        <NavLink
          to="/calendar"
          className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="2.5" width="14" height="12" rx="1.5"/>
            <line x1="1" y1="6.5" x2="15" y2="6.5"/>
            <line x1="4.5" y1="1" x2="4.5" y2="4"/>
            <line x1="11.5" y1="1" x2="11.5" y2="4"/>
          </svg>
          Dividend Calendar
        </NavLink>
      </nav>

      <div className={styles.right}>
        {timeStr && <span className={styles.lastUpdated}>Updated {timeStr}</span>}
        <button
          className={styles.refreshBtn}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}>
            <path d="M1 8a7 7 0 1 0 1.5-4.3"/>
            <polyline points="1,2 1,6 5,6"/>
          </svg>
          {refreshing ? 'Syncing…' : 'Refresh Data'}
        </button>
      </div>
    </header>
  )
}
