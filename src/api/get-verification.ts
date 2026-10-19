import type { Context } from 'hono'
import { findBySignToken, verificationView } from '../signing'
import type { Env } from '../types'

export const getVerification = async (c: Context<Env, '/api/verify/:token'>) => {
  const row = await findBySignToken(c.env.DB, c.req.param('token'))

  if (!row?.pdf_sha256) return c.json({ error: 'not_found' }, 404)

  return c.json(verificationView(row))
}
