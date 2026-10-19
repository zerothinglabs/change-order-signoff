import { z } from 'zod'

export const optionalText = (max: number, error: string) =>
  z
    .string({ error })
    .trim()
    .max(max, error)
    .nullish()
    .transform((value) => value || null)
