// EAN-13 format: prefix "23" + 10 random digits + 1 check digit
export function generateJanCode(): string {
  const digits = [2, 3, ...Array.from({ length: 10 }, () => Math.floor(Math.random() * 10))]
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0)
  const check = (10 - (sum % 10)) % 10
  return [...digits, check].join('')
}

// 商品化週: [4th digit of year][2-digit ISO week number]
// Example: 2026-06-05 (week 23) → "623"
export function getShochukaWeek(): string {
  const now = new Date()
  const yearDigit = now.getFullYear() % 10
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${yearDigit}${String(weekNumber).padStart(2, '0')}`
}

// 業績小分類コード: independent random 7-digit code
export function generateGyosekiCode(): string {
  return String(Math.floor(1000000 + Math.random() * 9000000))
}
