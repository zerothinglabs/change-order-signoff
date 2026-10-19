import { z } from 'zod'
import { optionalText } from '../lib'
import { EMAIL } from '../text-fields'
import { MAX_ORIGINAL_CENTS } from './constants'
import { splitContact } from './split-contact'
import type { JobInput } from './types'

const NAME_ERROR = 'Job name is required (up to 120 characters).'
const CLIENT_ERROR = 'Client name is required (up to 120 characters).'
const TOO_LONG_ERROR = 'Phone, email or address is too long.'
const EMAIL_ERROR = 'Client email is not valid.'
const ORIGINAL_ERROR = 'Original contract amount is not valid.'

const requiredText = (max: number, error: string) => z.string({ error }).trim().min(1, error).max(max, error)

const TextFields = z.object({
  name: requiredText(120, NAME_ERROR),
  client_name: requiredText(120, CLIENT_ERROR),
  client_contact: optionalText(40, TOO_LONG_ERROR),
  client_email: optionalText(254, TOO_LONG_ERROR),
  address: optionalText(200, TOO_LONG_ERROR),
})

const ValidatedFields = z.object({
  name: z.string(),
  client_name: z.string(),
  client_contact: z.string().nullable(),
  address: z.string().nullable(),
  client_email: z.string().regex(EMAIL, EMAIL_ERROR).nullable(),
  original_cents: z.coerce.number({ error: ORIGINAL_ERROR }).int(ORIGINAL_ERROR).min(0, ORIGINAL_ERROR).max(MAX_ORIGINAL_CENTS, ORIGINAL_ERROR),
})

const JobSchema = TextFields.extend({ original_cents: z.unknown().default(0) })
  .transform((fields, ctx) => {
    const contact = splitContact(fields.client_contact, fields.client_email)

    if (typeof contact === 'string') {
      ctx.issues.push({ code: 'custom', message: contact, input: fields })

      return z.NEVER
    }

    return { ...fields, client_contact: contact.phone, client_email: contact.email }
  })
  .pipe(ValidatedFields)
  .transform(
    ({ name, client_name, client_contact, client_email, address, original_cents }): JobInput => ({
      name,
      client: client_name,
      phone: client_contact,
      email: client_email,
      address,
      original: original_cents,
    }),
  )

export const parseJobInput = (body: Record<string, unknown>): JobInput | string => {
  const parsed = JobSchema.safeParse(body)

  return parsed.success ? parsed.data : parsed.error.issues[0]!.message
}
