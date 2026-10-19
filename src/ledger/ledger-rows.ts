import type { LedgerRow } from './types'

export const ledgerRows = async (db: D1Database, jobId: string) => {
  const { results } = await db.prepare(
    `SELECT co.id, co.number, co.title, co.status, co.amount_cents, co.days_impact, co.sent_at, s.decision, s.signer_name, s.signed_at
     FROM change_orders co LEFT JOIN signatures s ON s.change_order_id = co.id
     WHERE co.job_id = ? ORDER BY co.number`,
  ).bind(jobId).all<LedgerRow>()

  return results
}
