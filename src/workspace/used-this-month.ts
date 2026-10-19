import { utcMonthRange } from '../lib'

export const usedThisMonth = async (db: D1Database, wsId: string): Promise<number> => {
  const [from, to] = utcMonthRange()

  const row = await db.prepare('SELECT COUNT(*) AS n FROM change_orders WHERE workspace_id = ? AND sent_at >= ? AND sent_at < ?')
    .bind(wsId, from, to)
    .first<{ n: number }>()

  return row?.n ?? 0
}
