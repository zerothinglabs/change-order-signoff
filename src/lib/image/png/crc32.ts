import { CRC_TABLE } from './constants'

export const crc32 = (bytes: Uint8Array): number =>
  (bytes.reduce((crc, x) => CRC_TABLE[(crc ^ x) & 0xff]! ^ (crc >>> 8), 0xffffffff) ^ 0xffffffff) >>> 0
