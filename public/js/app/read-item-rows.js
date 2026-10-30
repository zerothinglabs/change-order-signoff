import { decimalValue } from './decimal-value.js'
import { flagField } from './flag-field.js'
import { toCents } from './to-cents.js'

const QTY_ERROR = 'Enter a number, like 2 or 1.5.'
const UNIT_ERROR = 'Enter a price, like 12.50 or -40.'

export function readItemRows() {
  return Array.from(document.querySelectorAll('#items .item'), (row) => {
    const qtyInput = row.querySelector('.i-qty')
    const unitInput = row.querySelector('.i-unit')
    const item = { desc: row.querySelector('.i-desc').value, qty: decimalValue(qtyInput.value), unit_cents: toCents(unitInput.value) }

    flagField(qtyInput, isNaN(item.qty) ? QTY_ERROR : '')
    flagField(unitInput, isNaN(item.unit_cents) ? UNIT_ERROR : '')

    return item
  })
}
