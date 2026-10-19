import type { Context } from 'hono'
import { r2Response } from '../r2-response'
import { findBySignToken } from '../signing'
import type { Env } from '../types'

export const getSigningLogo = async (c: Context<Env, '/api/sign/:token/logo'>) => {
  const row = await findBySignToken(c.env.DB, c.req.param('token'))

  return (await r2Response(c.env.FILES, row?.snap.business.logo_key)) ?? c.json({ error: 'not_found' }, 404)
}
