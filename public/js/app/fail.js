import { errorMessage } from '../shared/error-message.js'
import { errorNotice } from '../shared/error-notice.js'

export function fail(el, err) {
  el.innerHTML = errorNotice(errorMessage(err))
}
