import { randomToken } from '../../lib'

export const freezeLogo = async (files: R2Bucket, key: string, coId: string): Promise<string | null> => {
  const obj = await files.get(key)

  if (!obj) return null

  const frozen = `logo/co/${coId}/${randomToken(12)}`

  await files.put(frozen, await obj.arrayBuffer(), { httpMetadata: obj.httpMetadata })

  return frozen
}
