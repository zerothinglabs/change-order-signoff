export function lineCents(qty, unitCents) {
  const quantityInWholeHundredths = Math.round(qty * 100)

  return Math.round((quantityInWholeHundredths * unitCents) / 100)
}
