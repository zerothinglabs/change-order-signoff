import { FREE_LIMIT, utcMonthRange } from '../../lib'
import { now } from '../../now'
import type { ChangeOrder } from '../../types'
import type { FrozenRecord } from '../types'

export const freezeCo = (db: D1Database, co: ChangeOrder, wsId: string, frozen: FrozenRecord, unlimited: boolean) => {
  const [from, to] = utcMonthRange()

  return db.prepare(
    `UPDATE change_orders SET status = 'sent', sign_token = ?, snapshot_json = ?, snapshot_sha256 = ?, sent_at = ?
     WHERE id = ? AND status = 'draft' AND version = ? AND (uploading = 0 OR uploading_until <= ?)
       AND (? = 1 OR (SELECT COUNT(*) FROM change_orders WHERE workspace_id = ? AND sent_at >= ? AND sent_at < ?) < ?)`,
  ).bind(frozen.token, frozen.json, frozen.sha, frozen.sentAt, co.id, co.version, now(), unlimited ? 1 : 0, wsId, from, to, FREE_LIMIT).run()
}
