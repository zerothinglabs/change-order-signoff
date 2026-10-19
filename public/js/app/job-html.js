import { esc } from '../shared/esc.js'
import { money } from '../shared/money.js'
import { jobRowHtml } from './job-row-html.js'
import { signed } from './signed.js'

export function jobHtml(d) {
  const j = d.job
  const t = d.totals

  return '<div class="stack"><p><a class="link" href="app">All jobs</a></p>' +
    '<div data-zt-private><h1>' + esc(j.name) + '</h1><p class="muted">' + esc(j.client_name) + (j.address ? ' · ' + esc(j.address) : '') + '</p></div>' +
    '<div class="row"><a class="btn" href="app/co/new?job=' + esc(encodeURIComponent(j.id)) + '">New change order</a><button class="btn btn-outline" type="button" id="csv">Export CSV</button></div>' +
    '<div id="csv-msg"></div>' +
    '<table class="table" data-zt-private><thead><tr><th>Change order</th><th>Days</th><th>Amount</th></tr></thead><tbody>' +
    '<tr class="sub"><td>Original contract</td><td></td><td class="num">' + money(t.original) + '</td></tr>' + d.change_orders.map(jobRowHtml).join('') +
    '<tr class="sub"><td>Approved change orders</td><td></td><td class="num">' + signed(t.approved) + '</td></tr>' +
    '<tr class="total"><td>Current contract total</td><td></td><td class="num">' + money(t.current) + '</td></tr>' +
    '<tr class="sub"><td>Waiting for signature</td><td></td><td class="num">' + signed(t.pending) + '</td></tr>' +
    '</tbody></table>' +
    (d.change_orders.length ? '' : '<p class="muted">No change orders yet.</p>') + '</div>'
}
