import type { CoInput } from '../lib'

export const updateDraftCo = async (db: D1Database, coId: string, input: CoInput) => {
  const res = await db.prepare(
    `UPDATE change_orders SET title = ?, description = ?, items_json = ?, amount_cents = ?, days_impact = ?, payment_terms = ?,
       version = version + 1
     WHERE id = ? AND status = 'draft'`,
  ).bind(input.title, input.description || null, JSON.stringify(input.items), input.amount_cents, input.days_impact,
    input.payment_terms || null, coId).run()

  return !!res.meta.changes
}
