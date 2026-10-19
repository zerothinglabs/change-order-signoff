import type { CoInput } from '../lib'
import { now } from '../now'

export const insertCo = async (db: D1Database, wsId: string, jobId: string, input: CoInput) => {
  const id = crypto.randomUUID()

  await db.prepare(
    `INSERT INTO change_orders (id, workspace_id, job_id, number, title, description, items_json, amount_cents, days_impact, payment_terms, created_at)
     VALUES (?, ?, ?, (SELECT COALESCE(MAX(number), 0) + 1 FROM change_orders WHERE job_id = ?), ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(id, wsId, jobId, jobId, input.title, input.description || null, JSON.stringify(input.items), input.amount_cents,
    input.days_impact, input.payment_terms || null, now()).run()

  const row = await db.prepare('SELECT number FROM change_orders WHERE id = ?').bind(id).first<{ number: number }>()

  return { id, number: row!.number }
}
