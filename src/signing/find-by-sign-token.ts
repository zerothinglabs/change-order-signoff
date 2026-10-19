import type { Snapshot } from '../pdf'
import type { SignableRow, SignRowColumns } from './types'

export const findBySignToken = async (db: D1Database, token: string): Promise<SignableRow | null> => {
  const row = await db.prepare(
    `SELECT co.id, co.status, co.snapshot_json, co.snapshot_sha256, s.decision, s.signer_name, s.reason, s.signed_at, s.pdf_key, s.pdf_sha256
     FROM change_orders co LEFT JOIN signatures s ON s.change_order_id = co.id WHERE co.sign_token = ?`,
  ).bind(token).first<SignRowColumns>()

  if (!row || !row.snapshot_json) return null

  return { ...row, snap: JSON.parse(row.snapshot_json) as Snapshot }
}
