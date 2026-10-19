import { z } from 'zod'
import { errorReply } from '../error-reply'
import { MAX_PHOTOS } from '../lib'
import type { Bindings, ChangeOrder } from '../types'
import { attachPhoto } from './attach-photo'
import { UPLOAD_ID_PATTERN } from './constants'
import { photoKey, photoNumber } from './keys'
import { readPhotoBytes } from './read-photo-bytes'
import { settleLostAttach } from './settle-lost-attach'
import { releasePhotoSlot, reservePhotoSlot } from './slot'
import type { PhotoReply } from './types'

const UploadId = z.string().regex(UPLOAD_ID_PATTERN).nullish()

export const uploadPhoto = async (env: Bindings, co: ChangeOrder, form: FormData | null): Promise<PhotoReply> => {
  const uploadId = UploadId.safeParse(form?.get('upload_id'))

  if (!uploadId.success) return errorReply(400, 'Bad upload id.')

  const key = photoKey(co.id, uploadId.data)
  const stored = photoNumber(co.photos_json, key)

  if (stored) return { status: 200, body: { n: stored } }
  if (co.status !== 'draft') return errorReply(409, 'locked')
  if (co.photo_count >= MAX_PHOTOS) return errorReply(409, 'photo_limit')

  const bytes = await readPhotoBytes(form?.get('file'))

  if (typeof bytes === 'string') return errorReply(400, bytes)
  if (!(await reservePhotoSlot(env.DB, co.id))) return errorReply(409, 'photo_limit')

  try {
    await env.FILES.put(key, bytes, { httpMetadata: { contentType: 'image/jpeg' } })
  } catch {
    await releasePhotoSlot(env.DB, co.id)

    return errorReply(502, 'Could not save the photo. Try again.')
  }

  if (!(await attachPhoto(env.DB, co.id, key))) return settleLostAttach(env, co.id, key)

  const row = await env.DB.prepare('SELECT photo_count FROM change_orders WHERE id = ?').bind(co.id).first<{ photo_count: number }>()

  return { status: 201, body: { n: row!.photo_count } }
}
