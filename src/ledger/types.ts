export type LedgerRow = {
  id: string
  number: number
  title: string
  status: string
  amount_cents: number
  days_impact: number
  sent_at: string | null
  decision: string | null
  signer_name: string | null
  signed_at: string | null
}

export type Totals = { original: number; approved: number; pending: number; current: number }
