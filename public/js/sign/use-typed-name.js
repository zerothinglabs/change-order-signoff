import { nameOk } from './name-ok.js'
import { updateForm } from './update-form.js'

export function useTypedName(form) {
  if (!nameOk(form)) {
    form.name.focus()
    form.need.textContent = 'Type your full name first.'

    return
  }

  form.pad.typed(form.name.value.trim())
  updateForm(form)
}
