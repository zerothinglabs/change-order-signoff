import { esc } from '../shared/esc.js'
import { when } from '../shared/when.js'
import { pdfLink } from './pdf-link.js'
import { rel } from './rel.js'

export function signedCardHtml(d) {
  const s = d.signature

  return '<div class="card" data-zt-private><h2>' + (s.decision === 'approved' ? 'Approved' : 'Declined') + ' by ' + esc(s.signer_name) + '</h2>' +
    '<p class="small muted">' + esc(when(s.signed_at)) + ' (' + esc(s.signed_at) + ' UTC)</p>' +
    (d.pdf_url ? '<div class="row">' + pdfLink(d, 'Download your copy (PDF)') + '<a class="link" href="' + esc(rel(d.verify_url)) + '">Verify this record</a></div>' : '') + '</div>'
}
