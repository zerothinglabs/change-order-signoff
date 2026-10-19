import { hqUrl } from '../hq-url'
import type { Bindings } from '../types'
import { entitlementSchema } from './entitlement-schema'

export const fetchEntitlement = async (env: Bindings, vid: string) => {
  const query = new URLSearchParams({ slug: env.ZT_SLUG, vid })
  const res = await fetch(`${hqUrl(env)}/v1/entitlement?${query}`)

  if (!res.ok) return null

  return entitlementSchema.parse(await res.json())
}
