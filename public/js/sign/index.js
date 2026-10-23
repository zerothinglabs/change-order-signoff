import { loadSign } from './load-sign.js'
import { trackPageLeave } from '../shared/track-page-leave.js'

loadSign(true)
document.addEventListener('visibilitychange', trackPageLeave)
