import { api } from './api.js'

export function loadCoPhotos(co) {
  for (let n = 1; n <= co.photo_count; n++) {
    const img = document.createElement('img')

    img.alt = 'Photo ' + n
    document.getElementById('co-photos').appendChild(img)
    api('api/co/' + encodeURIComponent(co.id) + '/photo/' + n, { raw: true })
      .then((r) => (r.ok ? r.blob() : null))
      .then((b) => { if (b) img.src = URL.createObjectURL(b) })
  }
}
