import type { Context } from 'hono'
import { findCo, updateDraftCo } from '../change-orders'
import { validateCo } from '../lib'
import { readJsonObject } from '../read-json-object'
import type { Env } from '../types'

export const putCo = async (c: Context<Env, '/api/co/:id'>) => {
  const co = await findCo(c.env.DB, c.req.param('id'), c.get('ws').id)

  if (!co) return c.json({ error: 'not_found' }, 404)
  if (co.status !== 'draft') return c.json({ error: 'locked' }, 409)

  const input = validateCo(await readJsonObject(c.req))

  if (typeof input === 'string') return c.json({ error: input }, 400)
  if (!(await updateDraftCo(c.env.DB, co.id, input))) return c.json({ error: 'locked' }, 409)

  return c.json({ ok: true })
}
