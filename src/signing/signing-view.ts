import type { SignableRow } from './types'

export const signingView = (r: SignableRow, token: string) => {
  const s = r.snap

  return {
    status: r.status,
    business: { name: s.business.name, license_no: s.business.license_no, phone: s.business.phone },
    logo_url: s.business.logo_key ? `api/sign/${token}/logo` : null,
    job: { name: s.job.name, client_name: s.job.client_name, address: s.job.address },
    number: s.co.number, title: s.co.title, description: s.co.description, items: s.co.items,
    amount_cents: s.co.amount_cents, days_impact: s.co.days_impact, payment_terms: s.co.payment_terms,
    totals: s.totals, photos: s.photos.map((_, i) => `api/sign/${token}/photo/${i + 1}`), sent_at: s.sent_at,
    signature: r.decision ? { decision: r.decision, signer_name: r.signer_name, signed_at: r.signed_at } : null,
    pdf_url: r.pdf_key ? `api/sign/${token}/pdf` : null,
    verify_url: r.pdf_key ? `verify/${token}` : null,
  }
}
