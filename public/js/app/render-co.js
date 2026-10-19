import { api } from './api.js'
import { drawCo } from './draw-co.js'
import { fail } from './fail.js'
import { show } from './show.js'
import { view } from './view.js'

export function renderCo(id) {
  show('<p class="muted">Loading change order.</p>')
  api('api/co/' + encodeURIComponent(id)).then(drawCo).catch((err) => fail(view, err))
}
