import type { ChangeOrder } from '../types'

export const findCo = async (db: D1Database, coId: string, wsId: string) =>
  db.prepare('SELECT * FROM change_orders WHERE id = ? AND workspace_id = ?')
    .bind(coId, wsId)
    .first<ChangeOrder>()
