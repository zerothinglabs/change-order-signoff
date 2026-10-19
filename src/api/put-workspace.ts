import type { Context } from 'hono'
import { readJsonObject } from '../read-json-object'
import type { Env } from '../types'
import { updateWorkspace } from '../workspace'

export const putWorkspace = async (c: Context<Env>) => {
  const body = await readJsonObject(c.req)

  if (!body) return c.json({ error: 'Send JSON.' }, 400)

  const reply = await updateWorkspace(c.env.DB, c.get('ws').id, body)

  return c.json(reply.body, reply.status)
}
