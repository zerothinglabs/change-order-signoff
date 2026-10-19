import { errorMessage } from '../shared/error-message.js'
import { errorNotice } from '../shared/error-notice.js'
import { track } from '../shared/track.js'
import { loadSign } from './load-sign.js'
import { showSigned } from './show-signed.js'
import { signEndpoint } from './sign-endpoint.js'
import { updateForm } from './update-form.js'

export function submitDecision(decision, form) {
  const msg = document.getElementById('sign-msg')

  form.approve.disabled = form.declineBtn.disabled = true
  msg.innerHTML = '<p class="muted" role="status">Saving your signature.</p>'
  fetch(signEndpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ decision, signer_name: form.name.value.trim(), signature_png: form.pad.png(), reason: document.getElementById('reason').value.trim() || undefined }),
  }).then((r) => r.json().catch(() => ({})).then((j) => ({ r, j }))).then(({ r, j }) => {
    if (r.status === 409) return loadSign(false)
    if (!r.ok) throw new Error(j.error || 'Could not save. Try again.')

    track('co_signed', { decision })
    track('activated')
    showSigned(form.box, decision, j)
  }).catch((err) => {
    msg.innerHTML = errorNotice(errorMessage(err))
    updateForm(form)
  })
}
