import { PNG_SIGNATURE } from './constants'
import { crc32 } from './crc32'

export const pngChunksOk = (b: Uint8Array): boolean => {
  if (b.length < 8 || PNG_SIGNATURE.some((v, i) => b[i] !== v)) return false

  const view = new DataView(b.buffer, b.byteOffset, b.byteLength)
  let p = PNG_SIGNATURE.length

  while (p + 12 <= b.length) {
    const len = view.getUint32(p)

    if (p + 12 + len > b.length) return false

    const type = String.fromCharCode(...b.subarray(p + 4, p + 8))

    if ((p === PNG_SIGNATURE.length) !== (type === 'IHDR')) return false
    if (crc32(b.subarray(p + 4, p + 8 + len)) !== view.getUint32(p + 8 + len)) return false

    p += 12 + len

    if (type === 'IEND') return p === b.length
  }

  return false
}
