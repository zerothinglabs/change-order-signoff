import { esc } from '../shared/esc.js'

const labels = { draft: 'Draft', sent: 'Waiting for signature', approved: 'Approved', declined: 'Declined', void: 'Void' }

export function badge(status) {
  return '<span class="badge badge-' + esc(status) + '">' + esc(labels[status] || status) + '</span>'
}
