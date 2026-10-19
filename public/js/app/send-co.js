import { track } from '../shared/track.js'
import { amountBucket } from './amount-bucket.js'
import { api } from './api.js'
import { state } from './state.js'

export function sendCo(id) {
  return api('api/co/' + encodeURIComponent(id) + '/send', { method: 'POST' }).catch((err) => {
    if (err.code === 'free_limit') {
      sessionStorage.setItem('limitHit', id)
      track('free_limit_hit')
    }

    throw err
  }).then((d) => {
    state.ws.used_this_month++

    return api('api/co/' + encodeURIComponent(id)).then(
      (co) => track('co_sent', { amount_cents_bucket: amountBucket(co.amount_cents) }),
      () => track('co_sent', {}),
    ).then(() => d)
  })
}
