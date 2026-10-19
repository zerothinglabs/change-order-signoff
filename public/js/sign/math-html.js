import { days } from '../shared/days.js'
import { esc } from '../shared/esc.js'
import { money } from '../shared/money.js'
import { signedAmount } from './signed-amount.js'

export function mathHtml(d) {
  const t = d.totals

  return '<div class="card math" data-zt-private><div class="spread"><span class="muted">Previous contract total</span><span class="num">' + money(t.previous_cents) + '</span></div>' +
    '<div class="spread"><span class="muted">This change order</span><span class="num">' + signedAmount(t.co_cents) + '</span></div>' +
    '<div class="spread new"><span>New contract total</span><span class="num">' + money(t.new_cents) + '</span></div>' +
    '<div class="spread"><span class="muted">Schedule impact</span><span class="num">' + esc(days(d.days_impact)) + '</span></div>' +
    (d.payment_terms ? '<div class="spread"><span class="muted">Payment terms</span><span>' + esc(d.payment_terms) + '</span></div>' : '') + '</div>'
}
