import type { PDFDocument, PDFFont } from 'pdf-lib'
import type { Face, Fonts } from '../types'
import { toFace } from './to-face'

export const embedNeededFallbacks = async (doc: PDFDocument, fonts: Fonts, mainFonts: PDFFont[], drawnText: string): Promise<Face[]> => {
  const main = new Set(mainFonts.flatMap((f) => f.getCharacterSet()))
  const missing = [...new Set(drawnText.normalize('NFC'))].map((ch) => ch.codePointAt(0)!).filter((cp) => !main.has(cp))
  const fallbacks: Face[] = []

  if (!missing.length) return fallbacks

  for (const bytes of await fonts.fallbacks()) {
    const f = toFace(await doc.embedFont(bytes, { subset: true }))

    if (missing.some((cp) => f.chars.has(cp) && !fallbacks.some((o) => o.chars.has(cp)))) fallbacks.push(f)
  }

  return fallbacks
}
