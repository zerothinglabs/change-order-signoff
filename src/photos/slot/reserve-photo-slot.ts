import { addMilliseconds } from 'date-fns/addMilliseconds'
import { MAX_PHOTOS } from '../../lib'
import { now } from '../../now'
import { UPLOAD_LEASE_MS } from '../constants'

export const reservePhotoSlot = async (db: D1Database, coId: string) => {
  const t = now()
  const lease = addMilliseconds(t, UPLOAD_LEASE_MS).toISOString()

  const claim = await db.prepare(
    `UPDATE change_orders SET uploading = CASE WHEN uploading_until > ? THEN uploading + 1 ELSE 1 END, uploading_until = ?
     WHERE id = ? AND status = 'draft' AND photo_count + CASE WHEN uploading_until > ? THEN uploading ELSE 0 END < ?`,
  ).bind(t, lease, coId, t, MAX_PHOTOS).run()

  return !!claim.meta.changes
}
