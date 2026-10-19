import type { Context } from 'hono'
import { z } from 'zod'
import { insertCo } from '../change-orders'
import { findJob } from '../jobs'
import { validateCo } from '../lib'
import { readJsonObject } from '../read-json-object'
import type { Env } from '../types'

const JobId = z.preprocess((value) => value ?? '', z.coerce.string())

export const createCo = async (c: Context<Env>) => {
  const body = await readJsonObject(c.req)
  const input = validateCo(body)

  if (typeof input === 'string') return c.json({ error: input }, 400)

  const wsId = c.get('ws').id
  const job = await findJob(c.env.DB, JobId.parse(body?.job_id), wsId)

  if (!job) return c.json({ error: 'not_found' }, 404)

  return c.json(await insertCo(c.env.DB, wsId, job.id, input), 201)
}
