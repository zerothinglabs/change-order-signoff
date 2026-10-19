import { errorReply } from '../error-reply'
import type { Reply } from '../types'
import { parseWorkspaceFields } from './parse-workspace-fields'

export const updateWorkspace = async (
  db: D1Database,
  wsId: string,
  body: Record<string, unknown>,
): Promise<Reply<{ ok: true } | { error: string }>> => {
  const fields = parseWorkspaceFields(body)

  if (typeof fields === 'string') return errorReply(400, fields)

  await db.prepare('UPDATE workspaces SET business_name = ?, license_no = ?, phone = ?, email = ? WHERE id = ?')
    .bind(fields.business_name, fields.license_no, fields.phone, fields.email, wsId)
    .run()

  return { status: 200, body: { ok: true } }
}
