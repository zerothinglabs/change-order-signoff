import type { Context } from 'hono'
import { findJob } from '../jobs'
import { ledgerRows, totals } from '../ledger'
import type { Env } from '../types'

export const getJob = async (c: Context<Env, '/api/jobs/:id'>) => {
  const job = await findJob(c.env.DB, c.req.param('id'), c.get('ws').id)

  if (!job) return c.json({ error: 'not_found' }, 404)

  const rows = await ledgerRows(c.env.DB, job.id)

  return c.json({ job, change_orders: rows, totals: totals(job.original_cents, rows) })
}
