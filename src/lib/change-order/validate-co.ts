import { CoSchema } from './co-schema'
import type { CoInput } from './types'

export const validateCo = (body: unknown): CoInput | string => {
  const parsed = CoSchema.safeParse(body)

  return parsed.success ? parsed.data : parsed.error.issues[0]!.message
}
