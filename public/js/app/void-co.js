import { api } from './api.js'
import { fail } from './fail.js'
import { renderCo } from './render-co.js'

export function voidCo(co, msg) {
  if (!confirm('Void this change order? The link will show it was withdrawn. It still counts toward your monthly total.')) return

  api('api/co/' + encodeURIComponent(co.id) + '/void', { method: 'POST' }).then(() => renderCo(co.id)).catch((err) => fail(msg, err))
}
