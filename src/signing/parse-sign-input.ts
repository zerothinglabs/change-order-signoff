import { z } from 'zod'
import { optionalText } from '../lib'
import { decodeSignature } from './decode-signature'
import type { SignInput } from './types'

const DECISION_ERROR = 'Choose approve or decline.'
const NAME_ERROR = 'Type your full name (2 to 80 characters).'
const REASON_ERROR = 'Reason is too long (up to 500 characters).'

const SignerName = z
  .string({ error: NAME_ERROR })
  .trim()
  .transform((name) => name.replace(/\s+/g, ' '))
  .pipe(z.string().min(2, NAME_ERROR).max(80, NAME_ERROR))

const SignSchema = z
  .discriminatedUnion(
    'decision',
    [
      z.object({ decision: z.literal('approved'), signer_name: SignerName, reason: z.null().catch(null) }),
      z.object({ decision: z.literal('declined'), signer_name: SignerName, reason: optionalText(500, REASON_ERROR) }),
    ],
    { error: DECISION_ERROR },
  )
  .transform(({ decision, signer_name, reason }) => ({ decision, signerName: signer_name, reason }))

export const parseSignInput = async (body: Record<string, unknown> | null): Promise<SignInput | string> => {
  const parsed = SignSchema.safeParse(body)

  if (!parsed.success) return parsed.error.issues[0]!.message

  const signature = await decodeSignature(body?.signature_png)

  if (typeof signature === 'string') return signature

  return { ...parsed.data, signature }
}
