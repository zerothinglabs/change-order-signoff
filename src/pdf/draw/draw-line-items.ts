import { money, type Item } from '../../lib'
import { ITEM_COLUMNS } from '../constants'
import type { Writer } from '../writer'

export const drawLineItems = (w: Writer, items: Item[]) => {
  const { desc, qty, unit, amount } = ITEM_COLUMNS

  w.row([
    { t: 'Item', ...desc }, { t: 'Qty', ...qty, right: true }, { t: 'Unit', ...unit, right: true }, { t: 'Amount', ...amount, right: true },
  ], true)

  for (const it of items) {
    w.row([
      { t: it.desc, ...desc }, { t: String(it.qty), ...qty, right: true },
      { t: money(it.unit_cents), ...unit, right: true }, { t: money(it.line_cents), ...amount, right: true },
    ])
  }

  w.rule()
}
