import { photoKeys } from '../photos'
import type { Bindings, ChangeOrder } from '../types'

export const deleteDraftCo = async (env: Bindings, co: ChangeOrder) => {
  const res = await env.DB.prepare("DELETE FROM change_orders WHERE id = ? AND status = 'draft'").bind(co.id).run()

  if (!res.meta.changes) return false

  const keys = photoKeys(co.photos_json)

  if (keys.length) await env.FILES.delete(keys)

  return true
}
