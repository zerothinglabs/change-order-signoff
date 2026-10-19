import type { Context } from 'hono'
import { paidGate } from '../entitlement'
import { findJob } from '../jobs'
import { csvFileName, ledgerCsv, ledgerRows } from '../ledger'
import type { Env } from '../types'

export const exportJobCsv = async (c: Context<Env, '/api/jobs/:id/export.csv'>) => {
  const job = await findJob(c.env.DB, c.req.param('id'), c.get('ws').id)

  if (!job) return c.json({ error: 'not_found' }, 404)

  const denied = await paidGate(c.env, c.req.header('x-zt-vid'))

  if (denied) return c.json(denied.body, denied.status)

  return new Response(ledgerCsv(await ledgerRows(c.env.DB, job.id)), {
    headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="${csvFileName(job.name)}"` },
  })
}
