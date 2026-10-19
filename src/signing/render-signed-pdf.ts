import { PRODUCT_NAME } from '../constants'
import { isPng } from '../lib'
import { buildPdf } from '../pdf'
import type { Bindings } from '../types'
import { PDF_FAILED, PHOTO_MISSING } from './constants'
import { loadFonts } from './load-fonts'
import { loadPhotoBytes } from './load-photo-bytes'
import { readR2Bytes } from './read-r2-bytes'
import type { SignInput, SignRequest } from './types'

export const renderSignedPdf = async (env: Bindings, request: SignRequest, input: SignInput, signedAt: string): Promise<Uint8Array | string> => {
  const { row, ip, userAgent, verifyUrl, requestUrl } = request
  const snap = row.snap
  const photos = await loadPhotoBytes(env.FILES, snap.photos)

  if (!photos) return PHOTO_MISSING

  const logoBytes = snap.business.logo_key ? await readR2Bytes(env.FILES, snap.business.logo_key) : null
  const logo = logoBytes ? { bytes: logoBytes, png: isPng(logoBytes) } : null

  const record = {
    decision: input.decision, signer_name: input.signerName, reason: input.reason, signed_at: signedAt, ip, user_agent: userAgent,
    snapshot_sha256: row.snapshot_sha256, verify_url: verifyUrl, product: PRODUCT_NAME,
  }

  try {
    return await buildPdf(snap, record, input.signature, photos, logo, await loadFonts(env.ASSETS, requestUrl))
  } catch {
    return PDF_FAILED
  }
}
