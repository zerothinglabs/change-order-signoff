import { money } from '../shared/money.js'
import { lineCents } from './line-cents.js'
import { toCents } from './to-cents.js'

export function recalcItems(list) {
  let sum = 0

  list.querySelectorAll('.item').forEach((row) => {
    const q = parseFloat(row.querySelector('.i-qty').value)
    const u = toCents(row.querySelector('.i-unit').value)
    const line = isFinite(q) && !isNaN(u) ? lineCents(q, u) : 0

    row.querySelector('.i-line').textContent = money(line)
    sum += line
  })
  document.getElementById('total').textContent = money(sum)
  document.getElementById('add-item').disabled = list.children.length >= 20
  list.querySelectorAll('.i-del').forEach((b) => { b.disabled = list.children.length <= 1 })
}
