import { days } from '../shared/days.js'
import { esc } from '../shared/esc.js'
import { badge } from './badge.js'
import { coPath } from './co-path.js'
import { signed } from './signed.js'

export function jobRowHtml(co) {
  const inactive = co.status === 'declined' || co.status === 'void' || co.status === 'draft'
  const amount = inactive ? '<span class="muted">' + signed(co.amount_cents) + '</span>' : signed(co.amount_cents)

  return '<tr><td><a href="' + esc(coPath(co.id)) + '">#' + co.number + ' ' + esc(co.title) + '</a><div class="mt-4">' + badge(co.status) + '</div></td>' +
    '<td class="num">' + esc(days(co.days_impact)) + '</td><td class="num">' + amount + '</td></tr>'
}
