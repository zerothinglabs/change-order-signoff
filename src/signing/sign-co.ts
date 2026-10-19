import { errorReply } from '../error-reply'
import { sha256hex } from '../lib'
import { now } from '../now'
import type { Bindings, Reply } from '../types'
import { parseSignInput } from './parse-sign-input'
import { persistSignature } from './persist-signature'
import { renderSignedPdf } from './render-signed-pdf'
import type { SignRequest } from './types'

export const signCo = async (env: Bindings, request: SignRequest): Promise<Reply<{ pdf_url: string } | { error: string }>> => {
  const { row, body, token, ip, userAgent } = request

  if (row.status !== 'sent') return errorReply(409, row.status === 'void' ? 'withdrawn' : 'already_signed')

  const input = await parseSignInput(body)

  if (typeof input === 'string') return errorReply(400, input)

  const signedAt = now()
  const pdf = await renderSignedPdf(env, request, input, signedAt)

  if (typeof pdf === 'string') return errorReply(502, pdf)

  const doc = { ...input, signedAt, ip, userAgent, pdf, pdfSha: await sha256hex(pdf) }

  if (!(await persistSignature(env, row.id, doc))) return errorReply(409, 'already_signed')

  return { status: 200, body: { pdf_url: `api/sign/${token}/pdf` } }
}
