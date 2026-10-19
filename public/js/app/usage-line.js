import { state } from './state.js'
import { upgradeLink } from './upgrade-link.js'

export function usageLine() {
  const ws = state.ws

  if (ws.paid) return '<p>Pro plan. Unlimited change orders.</p>'

  const left = ws.free_limit - ws.used_this_month

  return '<div class="spread"><p>' + Math.min(ws.used_this_month, ws.free_limit) + ' of ' + ws.free_limit + ' free change orders used this month.' +
    (left <= 0 ? ' Upgrade to send more.' : '') + '</p>' + upgradeLink('dashboard', 'Upgrade') + '</div>'
}
