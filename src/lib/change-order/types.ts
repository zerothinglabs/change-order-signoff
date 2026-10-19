import type { z } from 'zod'
import type { CoSchema, ItemSchema } from './co-schema'

export type Item = z.infer<typeof ItemSchema>
export type CoInput = z.infer<typeof CoSchema>
