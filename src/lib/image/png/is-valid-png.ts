import extractChunks from 'png-chunks-extract'
import { PDFDocument } from 'pdf-lib'
import { decodableSize } from './decodable-size'

export const isValidPng = async (bytes: Uint8Array): Promise<boolean> => {
  try {
    const size = decodableSize(extractChunks(bytes), bytes.length)

    if (!size) return false

    const embeddedLikeBuildPdf = await (await PDFDocument.create()).embedPng(bytes)

    return embeddedLikeBuildPdf.width === size.width && embeddedLikeBuildPdf.height === size.height
  } catch {
    return false
  }
}
