import { fail } from './fail.js'
import { renderCo } from './render-co.js'
import { sendCo } from './send-co.js'

export function sendDraft(e, co, msg) {
  e.target.disabled = true

  sendCo(co.id).then(() => {
    sessionStorage.removeItem('limitHit')
    renderCo(co.id)
  }).catch((err) => {
    e.target.disabled = false

    if (err.code === 'free_limit') return renderCo(co.id)

    fail(msg, err)
  })
}
