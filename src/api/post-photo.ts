import type { Context } from 'hono'
import { findCo } from '../change-orders'
import { uploadPhoto } from '../photos'
import type { Env } from '../types'

export const postPhoto = async (c: Context<Env, '/api/co/:id/photos'>) => {
  const co = await findCo(c.env.DB, c.req.param('id'), c.get('ws').id)

  if (!co) return c.json({ error: 'not_found' }, 404)

  const reply = await uploadPhoto(c.env, co, await c.req.formData().catch(() => null))

  return c.json(reply.body, reply.status)
}
