export const b64url = (bytes: Uint8Array): string => {
  let s = ''

  for (const b of bytes) s += String.fromCharCode(b)

  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
