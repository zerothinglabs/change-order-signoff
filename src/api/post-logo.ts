import type { Context } from 'hono'
import { paidGate } from '../entitlement'
import type { Env } from '../types'
import { storeLogo } from '../workspace'

export const postLogo = async (c: Context<Env>) => {
  const denied = await paidGate(c.env, c.req.header('x-zt-vid'))

  if (denied) return c.json(denied.body, denied.status)

  const entry = (await c.req.formData().catch(() => null))?.get('file')
  const reply = await storeLogo(c.env, c.get('ws').id, entry)

  return c.json(reply.body, reply.status)
}
