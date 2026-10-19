import { coFormHtml } from './co-form-html.js'
import { pickPhotos } from './pick-photos.js'
import { show } from './show.js'
import { submitCoForm } from './submit-co-form.js'
import { wireItems } from './wire-items.js'

export function drawForm(co, editing) {
  const form = { co, editing, files: [], submitter: null }

  show(coFormHtml(co, editing))
  wireItems(document.getElementById('items'))
  document.getElementById('c-photos').onchange = (e) => pickPhotos(e, form)
  document.querySelectorAll('#co-form [type=submit]').forEach((b) => { b.onclick = () => { form.submitter = b } })
  document.getElementById('co-form').onsubmit = (e) => submitCoForm(e, form)
}
