export function encodeJpeg(canvas, quality = 0.85) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Could not read that photo.'))
      if (blob.size > 2 * 1024 * 1024 && quality > 0.4) return resolve(encodeJpeg(canvas, quality - 0.15))

      resolve(blob)
    }, 'image/jpeg', quality)
  })
}
