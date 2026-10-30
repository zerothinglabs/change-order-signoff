const DECIMAL = /^(?=\.?\d)(\d{1,3}(,\d{3})+|\d*)(\.\d{1,2})?$/

export function decimalValue(text) {
  const s = String(text).trim()

  return DECIMAL.test(s) ? Number(s.replace(/,/g, '')) : NaN
}
