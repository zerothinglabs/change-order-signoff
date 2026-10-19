import { z } from 'zod'
import { optionalText } from '../lib'
import { EMAIL } from '../text-fields'
import type { WorkspaceFields } from './types'

const TOO_LONG_ERROR = 'One of the fields is too long.'
const EMAIL_ERROR = 'Business email is not valid.'

const WorkspaceSchema = z.object({
  business_name: optionalText(100, TOO_LONG_ERROR),
  license_no: optionalText(50, TOO_LONG_ERROR),
  phone: optionalText(40, TOO_LONG_ERROR),
  email: optionalText(254, TOO_LONG_ERROR).pipe(z.string().regex(EMAIL, EMAIL_ERROR).nullable()),
})

export const parseWorkspaceFields = (body: Record<string, unknown>): WorkspaceFields | string => {
  const parsed = WorkspaceSchema.safeParse(body)

  return parsed.success ? parsed.data : parsed.error.issues[0]!.message
}
