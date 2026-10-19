import { signed } from './signed.js'

export function shareText(co, link) {
  const job = co.job || {}

  return 'Hi ' + job.client_name + ', here is change order #' + co.number + ' for ' + job.name + ': ' + co.title + ', ' + signed(co.amount_cents) +
    '. Please review and sign before I start this work: ' + link
}
