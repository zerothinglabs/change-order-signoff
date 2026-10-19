import { z } from 'zod'
import { isValidPng } from '../lib'
import { DRAW_SIGNATURE, MAX_SIGNATURE_BYTES, SIGNATURE_DATA_URL } from './constants'

export const decodeSignature = async (dataUrl: unknown): Promise<Uint8Array | string> => {
  const match = SIGNATURE_DATA_URL.exec(z.string().catch('').parse(dataUrl))

  if (!match) return DRAW_SIGNATURE

  let bytes: Uint8Array

  try {
    bytes = Uint8Array.from(atob(match[1]!), (ch) => ch.charCodeAt(0))
  } catch {
    return DRAW_SIGNATURE
  }

  if (bytes.length > MAX_SIGNATURE_BYTES) return 'Signature image is too large.'

  return (await isValidPng(bytes)) ? bytes : DRAW_SIGNATURE
}
