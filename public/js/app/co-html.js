import { days } from '../shared/days.js'
import { esc } from '../shared/esc.js'
import { badge } from './badge.js'
import { coActionsHtml } from './co-actions-html.js'
import { coItemRowHtml } from './co-item-row-html.js'
import { jobPath } from './job-path.js'
import { limitPromptHtml } from './limit-prompt-html.js'
import { signed } from './signed.js'

export function coHtml(co, link) {
  const job = co.job || {}
  const limitHit = sessionStorage.getItem('limitHit') === co.id && co.status === 'draft'

  return '<div class="stack"><p data-zt-private><a class="link" href="' + esc(jobPath(co.job_id)) + '">' + esc(job.name) + '</a></p>' +
    '<div class="stack-sm"><div>' + badge(co.status) + '</div><h1 data-zt-private>#' + co.number + ' ' + esc(co.title) + '</h1>' +
    (co.description ? '<p data-zt-private class="pre-line">' + esc(co.description) + '</p>' : '') + '</div>' +
    (limitHit ? limitPromptHtml() : '') +
    '<div id="co-msg"></div>' + coActionsHtml(co, link) +
    '<table class="table lines" data-zt-private><thead><tr><th>Item</th><th>Qty × unit</th><th>Amount</th></tr></thead><tbody>' + co.items.map(coItemRowHtml).join('') +
    '<tr class="total"><td>Total</td><td></td><td class="num">' + signed(co.amount_cents) + '</td></tr></tbody></table>' +
    '<p data-zt-private>Schedule impact: ' + esc(days(co.days_impact)) + '</p>' +
    (co.payment_terms ? '<p data-zt-private>Payment terms: ' + esc(co.payment_terms) + '</p>' : '') +
    (co.photo_count ? '<div class="photos ph-no-capture" id="co-photos" data-zt-private></div>' : '') + '</div>'
}
