import { coItems } from '../change-orders'
import { photoKeys } from '../photos'
import type { Snapshot } from '../pdf'
import type { SnapshotInput } from './types'

export const buildSnapshot = ({ ws, co, job, previousCents, sentAt, logoKey }: SnapshotInput): Snapshot => ({
  v: 1,
  sent_at: sentAt,
  business: {
    name: ws.business_name ?? '', license_no: ws.license_no ?? '', phone: ws.phone ?? '',
    logo_key: logoKey,
  },
  job: { name: job.name, client_name: job.client_name, address: job.address ?? '', original_cents: job.original_cents },
  co: {
    number: co.number, title: co.title, description: co.description ?? '', items: coItems(co),
    amount_cents: co.amount_cents, days_impact: co.days_impact, payment_terms: co.payment_terms ?? '',
  },
  totals: { previous_cents: previousCents, co_cents: co.amount_cents, new_cents: previousCents + co.amount_cents },
  photos: photoKeys(co.photos_json),
})
