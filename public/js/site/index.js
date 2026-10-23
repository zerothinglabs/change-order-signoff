import { holdBuyClick } from './hold-buy-click.js'
import { trackEventClick } from './track-event-click.js'
import { trackPageLeave } from '../shared/track-page-leave.js'

document.addEventListener('click', trackEventClick)
document.addEventListener('click', holdBuyClick)
document.addEventListener('visibilitychange', trackPageLeave)
