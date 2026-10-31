import { track } from '../shared/track.js'
import { api } from './api.js'
import { fail } from './fail.js'
import { fieldValue } from './field-value.js'
import { jobPath } from './job-path.js'
import { navigate } from './navigate.js'
import { toCents } from './to-cents.js'

export function submitJob(e) {
  e.preventDefault()

  const button = e.target.querySelector('[type=submit]')

  if (button.disabled) return

  const orig = fieldValue('j-orig').trim()
  const cents = orig ? toCents(orig) : 0
  const msg = document.getElementById('job-msg')

  if (isNaN(cents) || cents < 0) return fail(msg, { message: 'Enter the original contract amount in dollars, like 18400.' })

  button.disabled = true
  api('api/jobs', { json: {
    name: fieldValue('j-name'), client_name: fieldValue('j-client'),
    client_contact: fieldValue('j-contact'), client_email: fieldValue('j-email'), address: fieldValue('j-address'), original_cents: cents,
  } }).then((d) => {
    track('job_created')
    navigate(jobPath(d.id))
  }).catch((err) => {
    button.disabled = false
    fail(msg, err)
  })
}
