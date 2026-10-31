import { errorReply } from '../error-reply'
import type { Bindings } from '../types'
import { photoNumber } from './keys'
import { releasePhotoSlot } from './slot'
import type { PhotoReply } from './types'

export const settleLostAttach = async (env: Bindings, coId: string, key: string, prefix: string): Promise<PhotoReply> => {
  await releasePhotoSlot(env.DB, coId)
  await env.FILES.delete(key)

  const current = await env.DB.prepare('SELECT photos_json FROM change_orders WHERE id = ?').bind(coId).first<{ photos_json: string }>()
  const n = current ? photoNumber(current.photos_json, prefix) : 0

  if (n) return { status: 200, body: { n } }

  return errorReply(409, 'locked')
}
