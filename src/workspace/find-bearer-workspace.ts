import { findOwnerWorkspace } from './find-owner-workspace'

export const findBearerWorkspace = async (db: D1Database, authorization: string | undefined) => {
  const bearer = /^Bearer (\S+)$/.exec(authorization ?? '')

  return bearer && (await findOwnerWorkspace(db, bearer[1]!))
}
