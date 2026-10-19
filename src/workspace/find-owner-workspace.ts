import { sha256hex } from '../lib'
import type { Workspace } from '../types'

export const findOwnerWorkspace = async (db: D1Database, ownerToken: string) =>
  db.prepare('SELECT id, business_name, license_no, phone, email, logo_key FROM workspaces WHERE owner_token_hash = ?')
    .bind(await sha256hex(ownerToken))
    .first<Workspace>()
