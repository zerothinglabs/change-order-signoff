import { api } from './api.js'
import { resizePhoto } from './resize-photo.js'

export function uploadPhotos(id, files, msg, total = files.length) {
  if (!files.length) return Promise.resolve()

  msg.innerHTML = '<p class="muted" role="status">Uploading photo ' + (total - files.length + 1) + ' of ' + total + '.</p>'

  return resizePhoto(files[0]).then((blob) => {
    const fd = new FormData()

    fd.append('file', blob, 'photo.jpg')
    fd.append('upload_id', files[0].uploadId)

    return api('api/co/' + encodeURIComponent(id) + '/photos', { form: fd })
  }).then(() => {
    files.shift()

    return uploadPhotos(id, files, msg, total)
  })
}
