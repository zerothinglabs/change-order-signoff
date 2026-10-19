import { csvCell } from '../lib'
import { CSV_HEADER } from './constants'
import type { LedgerRow } from './types'

const csvLine = (r: LedgerRow) =>
  [r.number, r.title, r.status, (r.amount_cents / 100).toFixed(2), r.days_impact, r.signer_name, r.signed_at].map(csvCell).join(',')

export const ledgerCsv = (rows: LedgerRow[]) => [CSV_HEADER, ...rows.map(csvLine)].join('\r\n') + '\r\n'
