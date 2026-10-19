import fontkit from '@pdf-lib/fontkit'
import { PDFDocument } from 'pdf-lib'
import { drawHeader, drawLineItems, drawLogoUnlessBroken, drawPhotosOrThrow, drawSignedDecisionOrThrow, drawTotals } from './draw'
import { embedNeededFallbacks } from './fonts'
import type { Fonts, Logo, SignRecord, Snapshot } from './types'
import { Writer } from './writer'

export const buildPdf = async (
  snap: Snapshot, rec: SignRecord, signature: Uint8Array, photos: Uint8Array[], logo: Logo | null, fonts: Fonts,
): Promise<Uint8Array> => {
  const doc = await PDFDocument.create()

  doc.registerFontkit(fontkit)
  doc.setTitle(`Change order #${snap.co.number} - ${snap.job.name.normalize('NFC')}`)
  doc.setProducer(rec.product)
  doc.setCreator(rec.product)
  const font = await doc.embedFont(fonts.regular, { subset: true })
  const bold = await doc.embedFont(fonts.bold, { subset: true })
  const drawnText = JSON.stringify([snap.business, snap.job, snap.co, rec.signer_name, rec.reason ?? '', rec.user_agent])
  const w = new Writer(doc, font, bold, await embedNeededFallbacks(doc, fonts, [font, bold], drawnText))

  if (logo) await drawLogoUnlessBroken(doc, w, logo)

  drawHeader(w, snap)
  drawLineItems(w, snap.co.items)
  drawTotals(w, snap)
  await drawPhotosOrThrow(doc, w, photos)
  await drawSignedDecisionOrThrow(doc, w, rec, signature)

  return doc.save({ useObjectStreams: false })
}
