import { z } from 'zod'

export const entitlementSchema = z.object({ active: z.boolean().optional(), kind: z.string().nullable().optional() })
