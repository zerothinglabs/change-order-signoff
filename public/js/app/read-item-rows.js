import { toCents } from './to-cents.js'

export function readItemRows() {
  return Array.from(document.querySelectorAll('#items .item'), (row) => ({
    desc: row.querySelector('.i-desc').value, qty: parseFloat(row.querySelector('.i-qty').value), unit_cents: toCents(row.querySelector('.i-unit').value),
  }))
}
