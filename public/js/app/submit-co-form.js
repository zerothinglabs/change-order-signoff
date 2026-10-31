import { track } from '../shared/track.js'
import { coPath } from './co-path.js'
import { fail } from './fail.js'
import { fieldValue } from './field-value.js'
import { navigate } from './navigate.js'
import { readItemRows } from './read-item-rows.js'
import { saveCo } from './save-co.js'
import { sendCo } from './send-co.js'
import { uploadPhotos } from './upload-photos.js'

export function submitCoForm(e, form) {
  e.preventDefault()

  const sendNow = (e.submitter || form.submitter)?.getAttribute('data-send') === '1'
  const msg = document.getElementById('form-msg')
  const rows = readItemRows()

  if (rows.some((r) => isNaN(r.unit_cents) || isNaN(r.qty))) {
    document.querySelector('#items [aria-invalid]').focus()

    return fail(msg, { message: 'Fix the marked quantity or unit price.' })
  }

  const days = document.getElementById('c-days')

  if (days.validity.badInput) {
    days.focus()

    return fail(msg, { message: 'Schedule impact must be a whole number of days from -365 to 365.' })
  }

  const body = {
    job_id: form.co.job_id, title: fieldValue('c-title'), description: fieldValue('c-desc'),
    items: rows, days_impact: days.value, payment_terms: fieldValue('c-terms'),
  }

  const buttons = document.querySelectorAll('#co-form button')
  const photoCount = form.files.length
  let id

  buttons.forEach((b) => { b.disabled = true })
  msg.innerHTML = '<p class="muted" role="status">Saving.</p>'

  saveCo(form, body).then((savedId) => {
    id = savedId

    return uploadPhotos(id, form.files, msg)
  }).then(() => {
    if (!form.editing) track('co_created', { items: rows.length, photos: photoCount })
    if (!sendNow) return navigate(coPath(id))

    return sendCo(id).then(() => navigate(coPath(id)))
  }).catch((err) => {
    buttons.forEach((b) => { b.disabled = false })

    if (id && err.code === 'free_limit') return navigate(coPath(id))

    if (id && !form.editing) {
      form.editing = true
      form.co.id = id
    }

    fail(msg, err)
  })
}
