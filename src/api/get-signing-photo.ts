import type { Context } from 'hono'
import { keyAtPosition } from '../photos'
import { r2Response } from '../r2-response'
import { findBySignToken } from '../signing'
import type { Env } from '../types'

export const getSigningPhoto = async (c: Context<Env, '/api/sign/:token/photo/:n'>) => {
  const row = await findBySignToken(c.env.DB, c.req.param('token'))

  return (await r2Response(c.env.FILES, row && keyAtPosition(row.snap.photos, c.req.param('n')))) ?? c.json({ error: 'not_found' }, 404)
}
