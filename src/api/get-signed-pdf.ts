import type { Context } from 'hono'
import { r2Response } from '../r2-response'
import { findBySignToken } from '../signing'
import type { Env } from '../types'

export const getSignedPdf = async (c: Context<Env, '/api/sign/:token/pdf'>) => {
  const row = await findBySignToken(c.env.DB, c.req.param('token'))

  if (!row?.pdf_key) return c.json({ error: 'not_found' }, 404)

  const headers = { 'content-disposition': `attachment; filename="change-order-${row.snap.co.number}.pdf"` }

  return (await r2Response(c.env.FILES, row.pdf_key, headers)) ?? c.json({ error: 'not_found' }, 404)
}
