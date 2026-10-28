import { CHUNK_OVERHEAD, IHDR_DATA_LENGTH, MAX_DECODED_PNG_PIXELS, MAX_DECODED_PNG_SIDE, PNG_SIGNATURE_LENGTH } from './constants'

type Chunk = { name: string; data: Uint8Array }

export const decodableSize = (chunks: Chunk[], fileLength: number) => {
  const [header, ...extraHeaders] = chunks.filter((c) => c.name === 'IHDR')
  const parsedLength = chunks.reduce((sum, c) => sum + CHUNK_OVERHEAD + c.data.length, PNG_SIGNATURE_LENGTH)

  if (!header || extraHeaders.length || header.data.length !== IHDR_DATA_LENGTH || parsedLength !== fileLength) return null

  const view = new DataView(header.data.buffer, header.data.byteOffset, header.data.byteLength)
  const width = view.getUint32(0)
  const height = view.getUint32(4)
  const fits = width > 0 && height > 0 && width <= MAX_DECODED_PNG_SIDE && height <= MAX_DECODED_PNG_SIDE && width * height <= MAX_DECODED_PNG_PIXELS

  return fits ? { width, height } : null
}
