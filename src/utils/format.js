export function formatPrice(value, currency) {
  if (value === null || value === undefined) return '—'
  if (currency === 'GBP') return value >= 100 ? `${value.toFixed(0)}p` : `£${value.toFixed(2)}`
  if (currency === 'EUR') return `€${value.toFixed(2)}`
  return `$${value.toFixed(2)}`
}

export function formatYield(value) {
  if (!value || value === 0) return null
  return value.toFixed(2) + '%'
}

export function yieldClass(value) {
  if (!value || value === 0) return 'yield-zero'
  if (value >= 5) return 'yield-hi'
  return 'yield-mid'
}

export function exchangeBadgeClass(exchange) {
  const map = {
    NASDAQ: 'badge-nasdaq',
    SP500:  'badge-sp500',
    NYSE:   'badge-nyse',
    LSE:    'badge-lse',
    EUROPE: 'badge-europe',
  }
  return map[exchange] || 'badge-nasdaq'
}

export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

export const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
