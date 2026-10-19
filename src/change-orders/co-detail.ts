import type { ChangeOrder } from '../types'
import { coItems } from './co-items'

export const coDetail = async (db: D1Database, co: ChangeOrder) => {
  const job = await db.prepare('SELECT id, name, client_name, client_contact, address FROM jobs WHERE id = ?').bind(co.job_id).first()
  const sig = await db.prepare('SELECT decision, signer_name, reason, signed_at, pdf_sha256 FROM signatures WHERE change_order_id = ?').bind(co.id).first()

  return {
    id: co.id, job_id: co.job_id, number: co.number, title: co.title, description: co.description ?? '',
    items: coItems(co), amount_cents: co.amount_cents, days_impact: co.days_impact,
    payment_terms: co.payment_terms ?? '', photo_count: co.photo_count, status: co.status, sent_at: co.sent_at,
    sign_url: co.sign_token ? `s/${co.sign_token}` : null,
    pdf_url: sig && co.sign_token ? `api/sign/${co.sign_token}/pdf` : null,
    verify_url: sig && co.sign_token ? `verify/${co.sign_token}` : null,
    snapshot_sha256: co.snapshot_sha256, job, signature: sig,
  }
}
