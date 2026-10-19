import type { Context } from 'hono'
import type { Env } from '../types'
import { fetchEntitlement } from '../entitlement/fetch-entitlement'

export const proExample = async (c: Context<Env>) => {
  const vid = c.req.header('x-zt-vid')

  if (!vid) return c.json({ error: 'missing x-zt-vid' }, 400)

  const entitlement = await fetchEntitlement(c.env, vid).catch(() => null)

  if (!entitlement) return c.json({ error: 'entitlement check failed' }, 502)

  if (entitlement.active !== true) return c.json({ error: 'payment required' }, 402)

  return c.json({ ok: true, kind: entitlement.kind, message: 'Your Pro plan is active.' })
}
