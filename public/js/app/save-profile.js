import { api } from './api.js'
import { fail } from './fail.js'
import { fieldValue } from './field-value.js'
import { state } from './state.js'

export function saveProfile(e, msg) {
  e.preventDefault()

  const data = {
    business_name: fieldValue('p-name'), license_no: fieldValue('p-lic'),
    phone: fieldValue('p-phone'), email: fieldValue('p-email').trim(),
  }

  api('api/workspace', { method: 'PUT', json: data }).then(() => {
    Object.assign(state.ws, data)
    msg.innerHTML = '<p class="small">Saved.</p>'
  }).catch((err) => fail(msg, err))
}
