import { errorReply } from '../error-reply'
import { isJpeg, isPng, isValidPng } from '../lib'
import type { Bindings, Reply } from '../types'
import { uploadedFile } from '../uploaded-file'
import { LOGO_URL, MAX_LOGO_BYTES } from './constants'

export const storeLogo = async (
  env: Bindings,
  wsId: string,
  entry: File | string | null | undefined,
): Promise<Reply<{ logo_url: string } | { error: string }>> => {
  const file = uploadedFile(entry)

  if (!file) return errorReply(400, 'Choose a PNG or JPEG file.')
  if (file.size > MAX_LOGO_BYTES) return errorReply(400, 'Logo must be 1 MB or smaller.')

  const bytes = new Uint8Array(await file.arrayBuffer())
  const type = isPng(bytes) ? 'image/png' : isJpeg(bytes) ? 'image/jpeg' : null

  if (!type) return errorReply(400, 'Logo must be a PNG or JPEG file.')

  if (type === 'image/png' && !(await isValidPng(bytes))) {
    return errorReply(400, 'Logo PNG must be a complete image, at most 4000 px per side and 4 megapixels.')
  }

  const key = `logo/${wsId}`

  await env.FILES.put(key, bytes, { httpMetadata: { contentType: type } })
  await env.DB.prepare('UPDATE workspaces SET logo_key = ? WHERE id = ?').bind(key, wsId).run()

  return { status: 200, body: { logo_url: LOGO_URL } }
}
