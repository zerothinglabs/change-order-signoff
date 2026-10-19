import type { PDFDocument } from 'pdf-lib'
import type { Logo } from '../types'
import type { Writer } from '../writer'

export const drawLogoUnlessBroken = async (doc: PDFDocument, w: Writer, logo: Logo) => {
  try {
    const img = logo.png ? await doc.embedPng(logo.bytes) : await doc.embedJpg(logo.bytes)

    w.image(img, 160, 60)
  } catch {
    return
  }
}
