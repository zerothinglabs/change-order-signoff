import { decode } from 'jpeg-js'
import { MAX_JPEG_DECODE_MB, MAX_JPEG_MEGAPIXELS, MAX_JPEG_SIDE } from './constants'
import { isJpeg } from './is-jpeg'

const endsWithEoi = (b: Uint8Array) => b[b.length - 2] === 0xff && b[b.length - 1] === 0xd9

export const jpegOk = (b: Uint8Array): { width: number; height: number } | null => {
  if (!isJpeg(b) || !endsWithEoi(b)) return null

  try {
    const { width, height } = decode(b, {
      useTArray: true,
      formatAsRGBA: false,
      tolerantDecoding: false,
      maxResolutionInMP: MAX_JPEG_MEGAPIXELS,
      maxMemoryUsageInMB: MAX_JPEG_DECODE_MB,
    })

    return width <= MAX_JPEG_SIDE && height <= MAX_JPEG_SIDE ? { width, height } : null
  } catch {
    return null
  }
}
