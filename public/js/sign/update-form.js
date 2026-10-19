import { nameOk } from './name-ok.js'

export function updateForm(form) {
  const missing = []

  if (!nameOk(form)) missing.push('type your full name')
  if (!form.pad.strokes()) missing.push('sign in the box')
  if (!form.agree.checked) missing.push('tick the box')

  form.approve.disabled = missing.length > 0
  form.declineBtn.disabled = !nameOk(form) || !form.pad.strokes()
  form.need.textContent = missing.length ? 'To approve, ' + missing.join(', ') + '.' : ''
}
