import type { Context } from 'hono'
import { deleteDraftCo, findCo } from '../change-orders'
import type { Env } from '../types'

export const deleteCo = async (c: Context<Env, '/api/co/:id'>) => {
  const co = await findCo(c.env.DB, c.req.param('id'), c.get('ws').id)

  if (!co) return c.json({ error: 'not_found' }, 404)
  if (!(await deleteDraftCo(c.env, co))) return c.json({ error: 'locked' }, 409)

  return c.body(null, 204)
}
