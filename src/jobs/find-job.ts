import type { Job } from './types'

export const findJob = async (db: D1Database, jobId: string, wsId: string) =>
  db.prepare('SELECT id, name, client_name, client_contact, address, original_cents, created_at FROM jobs WHERE id = ? AND workspace_id = ?')
    .bind(jobId, wsId)
    .first<Job>()
