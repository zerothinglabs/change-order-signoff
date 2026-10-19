import { esc } from '../shared/esc.js'
import { shareText } from './share-text.js'

export function sentActionsHtml(co, link) {
  const job = co.job || {}
  const text = shareText(co, link)

  return '<div class="card ph-no-capture" data-zt-private><h2>Signing link</h2><p class="small muted" data-zt-private>Send this to ' + esc(job.client_name) + '. It works on any phone, no app needed.</p>' +
    '<div class="copy-box"><input id="sign-link" readonly aria-label="Signing link" value="' + esc(link) + '"></div>' +
    '<div class="row"><button class="btn btn-sm" type="button" id="copy-link">Copy</button>' +
    '<a class="btn btn-outline btn-sm" id="sms-link" href="sms:?&body=' + encodeURIComponent(text) + '">Text it</a>' +
    '<a class="btn btn-outline btn-sm" id="mail-link" href="mailto:?subject=' + encodeURIComponent('Change order #' + co.number + ' for ' + job.name) + '&body=' + encodeURIComponent(text) + '">Email it</a></div></div>' +
    '<div><button class="btn btn-danger" type="button" id="void">Void this change order</button></div>'
}
