export function photoForm(bytes: Uint8Array, uploadId?: string) {
  const f = new FormData()

  f.append('file', new File([bytes], 'p.jpg', { type: 'image/jpeg' }))

  if (uploadId) f.append('upload_id', uploadId)

  return f
}
