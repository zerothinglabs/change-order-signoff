import { money } from '../../lib'
import { TOTAL_COLUMNS } from '../constants'
import type { Snapshot } from '../types'
import type { Writer } from '../writer'

export const drawTotals = (w: Writer, snap: Snapshot) => {
  const sum = (label: string, v: string, isBold = false) =>
    w.row([{ t: label, ...TOTAL_COLUMNS.label }, { t: v, ...TOTAL_COLUMNS.value, right: true }], isBold)

  sum('Change order total', money(snap.co.amount_cents), true)
  sum('Previous contract total', money(snap.totals.previous_cents))
  sum('New contract total if approved', money(snap.totals.new_cents), true)
  const d = snap.co.days_impact

  sum('Schedule impact', d === 0 ? 'None' : `${d > 0 ? '+' : ''}${d} day${Math.abs(d) === 1 ? '' : 's'}`)

  if (snap.co.payment_terms) w.text(`Payment terms: ${snap.co.payment_terms}`, { gap: 8 })
}
