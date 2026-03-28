import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { TopBar } from './components/TopBar'
import { Screener } from './pages/Screener'
import { Calendar } from './pages/Calendar'
import styles from './App.module.css'

export default function App() {
  const [stocks, setStocks]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/stocks')
        if (!res.ok) throw new Error(`Server error: ${res.status}`)
        const json = await res.json()
        if (json.error) throw new Error(json.error)
        setStocks(json.stocks)
        setUpdatedAt(json.updatedAt)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className={styles.app}>
      <TopBar updatedAt={updatedAt} onRefresh={() => {
        setLoading(true)
        fetch('/api/stocks')
          .then(r => r.json())
          .then(json => { setStocks(json.stocks); setUpdatedAt(json.updatedAt) })
          .catch(e => setError(e.message))
          .finally(() => setLoading(false))
      }} />
      <main className={styles.main}>
        <Routes>
          <Route path="/"         element={<Screener stocks={stocks} loading={loading} error={error} updatedAt={updatedAt} />} />
          <Route path="/calendar" element={<Calendar stocks={stocks} loading={loading} />} />
        </Routes>
      </main>
    </div>
  )
}
