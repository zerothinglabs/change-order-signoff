export function editableItems(co) {
  const items = co.items && co.items.length ? co.items : [{ desc: '', qty: 1, unit_cents: '' }]

  return items.map((i) => ({ desc: i.desc, qty: i.qty, unit: i.unit_cents === '' ? '' : (i.unit_cents / 100).toFixed(2) }))
}
