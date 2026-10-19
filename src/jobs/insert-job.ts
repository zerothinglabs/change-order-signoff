import { now } from '../now'
import type { Bindings } from '../types'
import { emailHash } from './email-hash'
import type { JobInput } from './types'

export const insertJob = async (env: Bindings, wsId: string, input: JobInput) => {
  const id = crypto.randomUUID()
  const hash = input.email ? await emailHash(env.ZT_SLUG, input.email) : null

  await env.DB.prepare(
    'INSERT INTO jobs (id, workspace_id, name, client_name, client_contact, client_email_hash, address, original_cents, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).bind(id, wsId, input.name, input.client, input.phone, hash, input.address, input.original, now())
    .run()

  return id
}
