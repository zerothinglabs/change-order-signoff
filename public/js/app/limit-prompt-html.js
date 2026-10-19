import { state } from './state.js'
import { upgradeLink } from './upgrade-link.js'

export function limitPromptHtml() {
  return '<div class="notice stack-sm" role="alert"><p><strong>You used all ' + state.ws.free_limit + ' free change orders this month.</strong></p>' +
    '<p>Pro is $12/mo for unlimited change orders. Your draft is saved. Send it after you upgrade, or on the 1st of next month (UTC).</p><div>' + upgradeLink('limit') + '</div></div>'
}
