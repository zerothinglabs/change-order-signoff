import { uploadInFlight } from '../change-orders'
import type { ChangeOrder } from '../types'
import type { FailReason } from './types'

export const failReason = async (db: D1Database, co: ChangeOrder): Promise<FailReason> => {
  const current = await db.prepare('SELECT * FROM change_orders WHERE id = ?').bind(co.id).first<ChangeOrder>()

  if (current?.status !== 'draft') return 'locked'
  if (current.version !== co.version) return 'changed'

  return uploadInFlight(current) ? 'uploading' : 'free_limit'
}
