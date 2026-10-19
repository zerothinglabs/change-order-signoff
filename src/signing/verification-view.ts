import type { SignableRow } from './types'

export const verificationView = (r: SignableRow) => ({
  number: r.snap.co.number, business_name: r.snap.business.name, job_name: r.snap.job.name, decision: r.decision,
  signer_name: r.signer_name, signed_at: r.signed_at, snapshot_sha256: r.snapshot_sha256, pdf_sha256: r.pdf_sha256,
})
