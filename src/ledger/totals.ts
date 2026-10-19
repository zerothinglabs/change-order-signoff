import type { LedgerRow, Totals } from './types'

export const totals = (original: number, rows: LedgerRow[]): Totals => {
  const sumOf = (status: string) => rows.filter((r) => r.status === status).reduce((sum, r) => sum + r.amount_cents, 0)
  const approved = sumOf('approved')

  return { original, approved, pending: sumOf('sent'), current: original + approved }
}
