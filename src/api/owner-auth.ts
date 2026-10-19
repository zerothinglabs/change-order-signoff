import type { Context, Next } from 'hono'
import type { Env } from '../types'
import { findBearerWorkspace } from '../workspace'

export const ownerAuth = async (c: Context<Env>, next: Next) => {
  const ws = await findBearerWorkspace(c.env.DB, c.req.header('authorization'))

  if (!ws) return c.json({ error: 'unauthorized' }, 401)

  c.set('ws', ws)
  await next()
}
