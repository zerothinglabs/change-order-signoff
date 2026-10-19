import type { Snapshot } from '../pdf'

export type SignRowColumns = {
  id: string
  status: string
  snapshot_json: string
  snapshot_sha256: string
  decision: string | null
  signer_name: string | null
  reason: string | null
  signed_at: string | null
  pdf_key: string | null
  pdf_sha256: string | null
}

export type SignableRow = SignRowColumns & { snap: Snapshot }

export type SignInput = {
  decision: 'approved' | 'declined'
  signerName: string
  reason: string | null
  signature: Uint8Array
}

export type SignRequest = {
  row: SignableRow
  body: Record<string, unknown> | null
  token: string
  ip: string
  userAgent: string
  requestUrl: string
  verifyUrl: string
}

export type SignedDocument = SignInput & { signedAt: string; ip: string; userAgent: string; pdf: Uint8Array; pdfSha: string }
