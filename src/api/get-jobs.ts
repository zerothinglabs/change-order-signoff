import type { Context } from 'hono'
import { listJobs } from '../jobs'
import type { Env } from '../types'

export const getJobs = async (c: Context<Env>) => c.json(await listJobs(c.env.DB, c.get('ws').id))
