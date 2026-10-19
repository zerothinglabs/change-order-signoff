import { esc } from '../shared/esc.js'
import { rel } from './rel.js'

export function photosHtml(photos) {
  if (!photos.length) return ''

  return '<div class="photos ph-no-capture" data-zt-private>' + photos.map((p, i) =>
    '<a href="' + esc(rel(p)) + '" target="_blank" rel="noopener"><img src="' + esc(rel(p)) + '" alt="Photo ' + (i + 1) + ' of the work" loading="lazy"></a>',
  ).join('') + '</div>'
}
