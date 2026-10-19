import { view } from './view.js'

export function show(html) {
  view.innerHTML = html
  window.scrollTo(0, 0)
}
