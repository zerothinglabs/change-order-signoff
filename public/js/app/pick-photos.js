import { esc } from '../shared/esc.js'

export function pickPhotos(e, form) {
  const room = 4 - (form.co.photo_count || 0)
  const msg = document.getElementById('form-msg')

  form.files = Array.from(e.target.files).slice(0, room)
  form.files.forEach((f) => { f.uploadId = crypto.randomUUID() })
  msg.innerHTML = e.target.files.length > room ? '<p class="notice">Only the first ' + room + ' photo' + (room === 1 ? '' : 's') + ' will be attached.</p>' : ''
  document.getElementById('previews').innerHTML = form.files.map((f) => '<img alt="Selected photo ' + esc(f.name) + '" src="' + URL.createObjectURL(f) + '">').join('')
}
