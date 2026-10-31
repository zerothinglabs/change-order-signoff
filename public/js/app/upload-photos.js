import { api } from './api.js'
import { resizePhoto } from './resize-photo.js'

export function uploadPhotos(id, form, msg, total = form.files.length) {
  const files = form.files

  if (!files.length) return Promise.resolve()

  msg.innerHTML = '<p class="muted" role="status">Uploading photo ' + (total - files.length + 1) + ' of ' + total + '.</p>'

  return resizePhoto(files[0]).then((blob) => {
    const fd = new FormData()

    fd.append('file', blob, 'photo.jpg')
    fd.append('upload_id', files[0].uploadId)

    return api('api/co/' + encodeURIComponent(id) + '/photos', { form: fd })
  }).then(() => {
    files.shift()
    form.co.photo_count = (form.co.photo_count || 0) + 1

    return uploadPhotos(id, form, msg, total)
  })
}
