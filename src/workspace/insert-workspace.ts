import { randomToken, sha256hex } from '../lib'
import { now } from '../now'

export const insertWorkspace = async (db: D1Database, vid: string | undefined) => {
  const id = crypto.randomUUID()
  const ownerToken = randomToken(32)

  await db.prepare('INSERT INTO workspaces (id, owner_token_hash, vid, created_at) VALUES (?, ?, ?, ?)')
    .bind(id, await sha256hex(ownerToken), vid ?? null, now())
    .run()

  return { workspace_id: id, owner_token: ownerToken }
}
