import { isPaid } from '../entitlement'
import { FREE_LIMIT } from '../lib'
import type { Bindings, Workspace } from '../types'
import type { Plan } from './types'

export const lookupPlan = async (env: Bindings, vid: string | undefined, ws: Workspace, used: number): Promise<Plan | null> => {
  const checked = used >= FREE_LIMIT || !!ws.logo_key

  if (!checked) return { checked, paid: false }

  const paid = await isPaid(env, vid)

  if (paid === null && used >= FREE_LIMIT) return null

  return { checked, paid: paid === true }
}
