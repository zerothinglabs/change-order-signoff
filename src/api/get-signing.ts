import type { Context } from 'hono'
import { findBySignToken, signingView } from '../signing'
import type { Env } from '../types'

export const getSigning = async (c: Context<Env, '/api/sign/:token'>) => {
  const token = c.req.param('token')
  const row = await findBySignToken(c.env.DB, token)

  if (!row) return c.json({ error: 'not_found' }, 404)

  c.header('cache-control', 'no-store')

  return c.json(signingView(row, token))
}
