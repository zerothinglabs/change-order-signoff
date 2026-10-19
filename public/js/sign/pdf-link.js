import { esc } from '../shared/esc.js'
import { rel } from './rel.js'

export function pdfLink(d, label) {
  return '<a class="btn" id="pdf" href="' + esc(rel(d.pdf_url)) + '" download>' + esc(label) + '</a>'
}
