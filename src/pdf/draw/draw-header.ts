import type { Snapshot } from '../types'
import type { Writer } from '../writer'

export const drawHeader = (w: Writer, snap: Snapshot) => {
  const b = snap.business

  w.text(b.name || 'Contractor', { size: 16, bold: true, gap: 2 })
  const contact = [b.license_no && `License # ${b.license_no}`, b.phone].filter(Boolean).join('  ·  ')

  if (contact) w.text(contact, { size: 10 })

  w.rule()

  w.text(`Change order #${snap.co.number}: ${snap.co.title}`, { size: 14, bold: true })
  w.text(`Job: ${snap.job.name}`)
  w.text(`Client: ${snap.job.client_name}`)

  if (snap.job.address) w.text(`Address: ${snap.job.address}`)

  w.text(`Sent: ${snap.sent_at}`, { gap: 8 })

  if (snap.co.description) w.text(snap.co.description, { gap: 8 })
}
