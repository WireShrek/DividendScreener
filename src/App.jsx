import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { TopBar } from './components/TopBar'
import { Screener } from './pages/Screener'
import { Calendar } from './pages/Calendar'
import styles from './App.module.css'

export default function App() {
  return (
    <div className={styles.app}>
      <TopBar />
      <main className={styles.main}>
        <Routes>
          <Route path="/"         element={<Screener />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
      </main>
    </div>
  )
}
