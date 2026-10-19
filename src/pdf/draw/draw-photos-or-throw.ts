import type { PDFDocument } from 'pdf-lib'
import { MARGIN, PAGE_WIDTH } from '../constants'
import type { Writer } from '../writer'

export const drawPhotosOrThrow = async (doc: PDFDocument, w: Writer, photos: Uint8Array[]) => {
  for (const [i, bytes] of photos.entries()) {
    const img = await doc.embedJpg(bytes)

    w.text(`Photo ${i + 1}`, { bold: true, size: 9 })
    w.image(img, PAGE_WIDTH - 2 * MARGIN, 300)
  }
}
