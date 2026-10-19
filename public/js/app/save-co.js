import { api } from './api.js'

export function saveCo(form, body) {
  return form.editing
    ? api('api/co/' + encodeURIComponent(form.co.id), { method: 'PUT', json: body }).then(() => form.co.id)
    : api('api/co', { json: body }).then((d) => d.id)
}
