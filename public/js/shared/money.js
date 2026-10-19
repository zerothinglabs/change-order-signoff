const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function money(cents) {
  const dollarsWithoutNegativeZero = cents / 100 || 0

  return usd.format(dollarsWithoutNegativeZero)
}
