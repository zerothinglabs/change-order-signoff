import { esc } from '../shared/esc.js'

const row = (k, val, cls) => '<div><dt>' + k + '</dt><dd' + (cls ? ' class="' + cls + '"' : '') + '>' + esc(val) + '</dd></div>'

export function recordHtml(v) {
  return '<dl class="facts card" data-zt-private>' +
    row('Change order', '#' + v.number) + row('Business', v.business_name) + row('Job', v.job_name) +
    row('Decision', v.decision === 'approved' ? 'Approved' : 'Declined') + row('Signer name', v.signer_name) +
    row('Signed at (UTC)', v.signed_at, 'hash') + row('Snapshot SHA-256', v.snapshot_sha256, 'hash') + row('PDF SHA-256', v.pdf_sha256, 'hash') +
    '</dl>'
}
