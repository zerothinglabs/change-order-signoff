import { esc } from '../shared/esc.js'
import { headHtml } from './head-html.js'
import { itemRowHtml } from './item-row-html.js'
import { mathHtml } from './math-html.js'
import { photosHtml } from './photos-html.js'
import { signedAmount } from './signed-amount.js'

export function signBodyHtml(d) {
  return '<div class="stack">' + headHtml(d) +
    '<div data-zt-private><h1>Change order #' + d.number + ': ' + esc(d.title) + '</h1>' +
    '<p class="muted">' + esc(d.job.name) + ' · ' + esc(d.job.client_name) + (d.job.address ? ' · ' + esc(d.job.address) : '') + '</p></div>' +
    (d.description ? '<p data-zt-private class="pre-line">' + esc(d.description) + '</p>' : '') +
    '<table class="table lines" data-zt-private><thead><tr><th>Item</th><th>Qty × unit</th><th>Amount</th></tr></thead><tbody>' + d.items.map(itemRowHtml).join('') +
    '<tr class="total"><td>Change order total</td><td></td><td class="num">' + signedAmount(d.amount_cents) + '</td></tr></tbody></table>' +
    mathHtml(d) + photosHtml(d.photos) +
    '<div id="decision"></div></div>'
}
