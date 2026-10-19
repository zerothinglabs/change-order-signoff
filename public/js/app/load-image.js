export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not read ' + file.name + '. Use a JPEG or PNG photo.'))
    img.src = URL.createObjectURL(file)
  })
}
