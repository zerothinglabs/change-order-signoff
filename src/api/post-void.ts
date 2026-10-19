import type { Context } from 'hono'
import { findCo, voidCo } from '../change-orders'
import type { Env } from '../types'

export const postVoid = async (c: Context<Env, '/api/co/:id/void'>) => {
  const co = await findCo(c.env.DB, c.req.param('id'), c.get('ws').id)

  if (!co) return c.json({ error: 'not_found' }, 404)
  if (!(await voidCo(c.env.DB, co))) return c.json({ error: 'locked' }, 409)

  return c.json({ ok: true })
}
