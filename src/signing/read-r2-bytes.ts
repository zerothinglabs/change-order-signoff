export const readR2Bytes = async (files: R2Bucket, key: string) => {
  const obj = await files.get(key)

  return obj ? new Uint8Array(await obj.arrayBuffer()) : null
}
