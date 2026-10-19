import { randomToken } from '../lib'
import type { Bindings } from '../types'
import { claimSignature } from './claim-signature'
import type { SignedDocument } from './types'

export const persistSignature = async (env: Bindings, coId: string, doc: SignedDocument) => {
  const attempt = randomToken(12)
  const sigKey = `sig/${coId}/${attempt}.png`
  const pdfKey = `pdf/${coId}/${attempt}.pdf`

  await env.FILES.put(sigKey, doc.signature, { httpMetadata: { contentType: 'image/png' } })
  await env.FILES.put(pdfKey, doc.pdf, { httpMetadata: { contentType: 'application/pdf' } })

  const won = await claimSignature(env.DB, coId, doc, pdfKey)

  if (!won) await env.FILES.delete([sigKey, pdfKey])

  return won
}
