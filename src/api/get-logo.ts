import type { Context } from 'hono'
import { r2Response } from '../r2-response'
import type { Env } from '../types'

export const getLogo = async (c: Context<Env>) => (await r2Response(c.env.FILES, c.get('ws').logo_key)) ?? c.json({ error: 'not_found' }, 404)
