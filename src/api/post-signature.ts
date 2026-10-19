import type { Context } from 'hono'
import { readJsonObject } from '../read-json-object'
import { buildSignRequest, findBySignToken, signCo } from '../signing'
import type { Env } from '../types'

export const postSignature = async (c: Context<Env, '/api/sign/:token'>) => {
  const token = c.req.param('token')
  const row = await findBySignToken(c.env.DB, token)

  if (!row) return c.json({ error: 'not_found' }, 404)

  const reply = await signCo(c.env, buildSignRequest(row, await readJsonObject(c.req), token, c.req.raw))

  return c.json(reply.body, reply.status)
}
