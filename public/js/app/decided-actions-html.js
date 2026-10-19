import { esc } from '../shared/esc.js'
import { when } from '../shared/when.js'

export function decidedActionsHtml(co) {
  const s = co.signature || {}

  return '<div class="card" data-zt-private><h2>' + (co.status === 'approved' ? 'Approved' : 'Declined') + ' by ' + esc(s.signer_name) + '</h2>' +
    '<p class="small muted">' + esc(when(s.signed_at)) + ' (' + esc(s.signed_at) + ' UTC)</p>' +
    (s.reason ? '<p>Reason: ' + esc(s.reason) + '</p>' : '') +
    '<div class="row"><a class="btn" id="pdf" href="' + esc(co.pdf_url) + '" download>Download PDF</a><a class="btn btn-outline" href="' + esc(co.verify_url) + '">Verify page</a></div></div>'
}
