export const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

export const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n

  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1

  return c >>> 0
})

export const MAX_DECODED_PNG_SIDE = 4000
export const MAX_DECODED_PNG_PIXELS = 4_000_000
export const IHDR_DATA_LENGTH = 13
