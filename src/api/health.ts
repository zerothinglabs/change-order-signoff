import type { Context } from 'hono'
import type { Env } from '../types'

export const health = (c: Context<Env>) => c.json({ ok: true, slug: c.env.ZT_SLUG })
