import type { SnapshotJob } from './types'

export const loadSnapshotJob = async (db: D1Database, jobId: string) =>
  (await db.prepare('SELECT name, client_name, address, original_cents FROM jobs WHERE id = ?').bind(jobId).first<SnapshotJob>())!
