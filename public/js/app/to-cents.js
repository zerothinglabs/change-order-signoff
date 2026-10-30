import { decimalValue } from './decimal-value.js'

export function toCents(v) {
  const text = String(v).trim()
  const cents = Math.round(decimalValue(text.replace(/^-?\$?/, '')) * 100)

  return text.startsWith('-') ? -cents : cents
}
