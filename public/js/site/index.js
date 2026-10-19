import { holdBuyClick } from './hold-buy-click.js'
import { trackEventClick } from './track-event-click.js'

document.addEventListener('click', trackEventClick)
document.addEventListener('click', holdBuyClick)
