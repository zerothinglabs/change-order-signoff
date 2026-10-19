import type { Context } from 'hono'
import { findCo } from '../change-orders'
import { photoKeyAt } from '../photos'
import { r2Response } from '../r2-response'
import type { Env } from '../types'

export const getPhoto = async (c: Context<Env, '/api/co/:id/photo/:n'>) => {
  const co = await findCo(c.env.DB, c.req.param('id'), c.get('ws').id)

  return (await r2Response(c.env.FILES, co && photoKeyAt(co.photos_json, c.req.param('n')))) ?? c.json({ error: 'not_found' }, 404)
}
