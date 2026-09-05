export function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isoDaysAgo(days) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function daysSince(iso) {
  if (!iso) return 0
  const start = new Date(`${iso}T00:00:00`)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.floor((now - start) / 86400000)
}

export function money(n) {
  const value = Number(n) || 0
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function num(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function getStatus(order) {
  if (order.sold) return 'sold'
  if (order.signDate) return 'stock'
  return 'pending'
}

export function profitOf(order) {
  if (!order.sold) return 0
  return (
    num(order.sold.sellPrice) +
    num(order.rebate) -
    num(order.buyPrice) -
    num(order.commission)
  )
}

export function costOf(order) {
  return num(order.buyPrice) + num(order.commission)
}

export function isRiskStock(order) {
  return getStatus(order) === 'stock' && daysSince(order.signDate) > 5
}
