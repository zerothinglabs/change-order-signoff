import type { PDFFont } from 'pdf-lib'
import type { Item } from '../lib'

export type Snapshot = {
  v: 1
  sent_at: string
  business: { name: string; license_no: string; phone: string; logo_key: string | null }
  job: { name: string; client_name: string; address: string; original_cents: number }
  co: {
    number: number
    title: string
    description: string
    items: Item[]
    amount_cents: number
    days_impact: number
    payment_terms: string
  }
  totals: { previous_cents: number; co_cents: number; new_cents: number }
  photos: string[]
}

export type SignRecord = {
  decision: 'approved' | 'declined'
  signer_name: string
  reason: string | null
  signed_at: string
  ip: string
  user_agent: string
  snapshot_sha256: string
  verify_url: string
  product: string
}

export type Logo = { bytes: Uint8Array; png: boolean }

export type Fonts = { regular: Uint8Array; bold: Uint8Array; fallbacks: () => Promise<Uint8Array[]> }

export type Face = { font: PDFFont; chars: Set<number> }

export type Cell = { t: string; x: number; w: number; right?: boolean }
