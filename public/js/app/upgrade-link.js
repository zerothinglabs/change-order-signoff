import { esc } from '../shared/esc.js'

export function upgradeLink(from, text) {
  return '<a class="btn" href="pricing" data-zt-buy="monthly" data-upgrade="' + esc(from) + '">' + esc(text || 'Upgrade to Pro, $12/mo') + '</a>'
}
