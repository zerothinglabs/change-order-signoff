import { makePad } from './make-pad.js'
import { signFormHtml } from './sign-form-html.js'
import { submitDecision } from './submit-decision.js'
import { toggleDecline } from './toggle-decline.js'
import { updateForm } from './update-form.js'
import { useTypedName } from './use-typed-name.js'

export function drawSignForm(box, d) {
  box.innerHTML = signFormHtml(d)

  const form = {
    box,
    name: document.getElementById('name'),
    agree: document.getElementById('agree'),
    approve: document.getElementById('approve'),
    declineBtn: document.getElementById('decline-btn'),
    need: document.getElementById('need'),
    pad: null,
  }

  const toggle = document.getElementById('decline-toggle')

  form.pad = makePad(document.getElementById('pad'), () => updateForm(form))
  form.name.addEventListener('input', () => updateForm(form))
  form.agree.addEventListener('change', () => updateForm(form))

  document.getElementById('clear').onclick = () => {
    form.pad.clear()
    updateForm(form)
  }

  document.getElementById('typed').onclick = () => useTypedName(form)
  toggle.onclick = () => toggleDecline(toggle)
  updateForm(form)

  document.getElementById('sign-form').onsubmit = (e) => {
    e.preventDefault()

    if (!form.approve.disabled) submitDecision('approved', form)
  }

  form.declineBtn.onclick = () => {
    if (!form.declineBtn.disabled) submitDecision('declined', form)
  }
}
