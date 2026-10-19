import { absoluteUrl } from './absolute-url.js'
import { coHtml } from './co-html.js'
import { loadCoPhotos } from './load-co-photos.js'
import { show } from './show.js'
import { wireCoActions } from './wire-co-actions.js'

export function drawCo(co) {
  const link = co.sign_url ? absoluteUrl(co.sign_url) : ''

  show(coHtml(co, link))
  loadCoPhotos(co)
  wireCoActions(co, link)
}
