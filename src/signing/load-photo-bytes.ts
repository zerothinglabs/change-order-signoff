import { readR2Bytes } from './read-r2-bytes'

export const loadPhotoBytes = async (files: R2Bucket, keys: string[]) => {
  const loaded = await Promise.all(keys.map((key) => readR2Bytes(files, key)))

  return loaded.some((bytes) => bytes === null) ? null : (loaded as Uint8Array[])
}
