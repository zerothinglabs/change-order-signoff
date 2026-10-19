import { fetchEntitlement } from './fetch-entitlement'
import type { Bindings } from '../types'

export const isPaid = async (env: Bindings, vid: string | undefined): Promise<boolean | null> => {
  if (!vid) return false

  const entitlement = await fetchEntitlement(env, vid).catch(() => null)

  return entitlement ? entitlement.active === true : null
}
