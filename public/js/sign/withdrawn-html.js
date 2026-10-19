import { esc } from '../shared/esc.js'
import { headHtml } from './head-html.js'

export function withdrawnHtml(d) {
  return '<div class="stack">' + headHtml(d) + '<h1 data-zt-private>Change order #' + d.number + ': ' + esc(d.title) + '</h1>' +
    '<p class="notice" role="status">This change order was withdrawn by the contractor.</p></div>'
}
