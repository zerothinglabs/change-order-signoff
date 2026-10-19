import { esc } from '../shared/esc.js'
import { money } from '../shared/money.js'

export function coItemRowHtml(i) {
  return '<tr><td>' + esc(i.desc) + '</td><td class="num">' + esc(i.qty) + ' × ' + money(i.unit_cents) + '</td><td class="num">' + money(i.line_cents) + '</td></tr>'
}
