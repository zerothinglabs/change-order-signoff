import type { ChangeOrder } from '../types'

export const voidCo = async (db: D1Database, co: ChangeOrder) => {
  if (co.status === 'void') return true

  const res = await db.prepare("UPDATE change_orders SET status = 'void' WHERE id = ? AND status IN ('draft', 'sent')").bind(co.id).run()

  return !!res.meta.changes
}
