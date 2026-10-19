import { encodeJpeg } from './encode-jpeg.js'
import { loadImage } from './load-image.js'

export function resizePhoto(file) {
  return loadImage(file).then((img) => {
    const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')

    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(img.src)

    return encodeJpeg(canvas)
  })
}
