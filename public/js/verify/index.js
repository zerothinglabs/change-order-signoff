import { errorNotice } from '../shared/error-notice.js'
import { loadRecord } from './load-record.js'
import { recordHtml } from './record-html.js'
import { trackPageLeave } from '../shared/track-page-leave.js'

const el = document.getElementById('record')
const token = location.pathname.split('/').filter(Boolean).pop()

loadRecord(token)
  .then((v) => { el.innerHTML = recordHtml(v) })
  .catch((err) => { el.innerHTML = errorNotice(err.message) })

document.addEventListener('visibilitychange', trackPageLeave)
