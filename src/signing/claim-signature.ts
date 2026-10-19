import type { SignedDocument } from './types'

export const claimSignature = async (db: D1Database, coId: string, doc: SignedDocument, pdfKey: string) => {
  try {
    const [inserted] = await db.batch([
      db.prepare(
        `INSERT INTO signatures (change_order_id, decision, signer_name, reason, ip, user_agent, signed_at, pdf_key, pdf_sha256)
         SELECT ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM change_orders WHERE id = ? AND status = 'sent')`,
      ).bind(coId, doc.decision, doc.signerName, doc.reason, doc.ip, doc.userAgent, doc.signedAt, pdfKey, doc.pdfSha, coId),
      db.prepare("UPDATE change_orders SET status = ? WHERE id = ? AND status = 'sent'").bind(doc.decision, coId),
    ])

    return !!inserted?.meta.changes
  } catch {
    return false
  }
}
