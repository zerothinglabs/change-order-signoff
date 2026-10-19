import type { Context } from 'hono'
import { findCo } from '../change-orders'
import { sendCo } from '../sending'
import type { Env } from '../types'

export const postSend = async (c: Context<Env, '/api/co/:id/send'>) => {
  const co = await findCo(c.env.DB, c.req.param('id'), c.get('ws').id)

  if (!co) return c.json({ error: 'not_found' }, 404)

  const reply = await sendCo(c.env, c.req.header('x-zt-vid'), c.get('ws'), co)

  return c.json(reply.body, reply.status)
}
