import { PDFDocument } from 'pdf-lib'
import { IHDR_DATA_LENGTH, MAX_DECODED_PNG_PIXELS, MAX_DECODED_PNG_SIDE } from './constants'
import { pngChunksOk } from './png-chunks-ok'

export const isValidPng = async (bytes: Uint8Array): Promise<boolean> => {
  if (!pngChunksOk(bytes)) return false

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

  if (view.getUint32(8) !== IHDR_DATA_LENGTH) return false

  const width = view.getUint32(16)
  const height = view.getUint32(20)

  if (!width || !height || width > MAX_DECODED_PNG_SIDE || height > MAX_DECODED_PNG_SIDE || width * height > MAX_DECODED_PNG_PIXELS) return false

  try {
    const embeddedLikeBuildPdf = await (await PDFDocument.create()).embedPng(bytes)

    return embeddedLikeBuildPdf.width === width && embeddedLikeBuildPdf.height === height
  } catch {
    return false
  }
}
