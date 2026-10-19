import type { Context } from 'hono'
import { insertJob, parseJobInput } from '../jobs'
import { readJsonObject } from '../read-json-object'
import type { Env } from '../types'

export const createJob = async (c: Context<Env>) => {
  const body = await readJsonObject(c.req)

  if (!body) return c.json({ error: 'Send JSON.' }, 400)

  const input = parseJobInput(body)

  if (typeof input === 'string') return c.json({ error: input }, 400)

  return c.json({ id: await insertJob(c.env, c.get('ws').id, input) }, 201)
}
