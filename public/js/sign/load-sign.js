import { errorNotice } from '../shared/error-notice.js'
import { track } from '../shared/track.js'
import { renderSign } from './render-sign.js'
import { signEndpoint } from './sign-endpoint.js'
import { view } from './view.js'

export function loadSign(first) {
  return fetch(signEndpoint, { cache: 'no-store' }).then((r) => {
    if (r.status === 404) throw new Error('This signing link does not work. Ask your contractor to send it again.')
    if (!r.ok) throw new Error('Could not load the change order. Try again.')

    return r.json()
  }).then((d) => {
    if (first) track('sign_page_viewed', { status: d.status })

    renderSign(d)
  }).catch((err) => {
    view.innerHTML = errorNotice(err.message)
  })
}
