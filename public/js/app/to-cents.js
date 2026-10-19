export function toCents(v) {
  const n = parseFloat(String(v).replace(/[$,\s]/g, ''))

  return isFinite(n) ? Math.round(n * 100) : NaN
}
