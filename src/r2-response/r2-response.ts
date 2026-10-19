export const r2Response = async (files: R2Bucket, key: string | null | undefined, extraHeaders: Record<string, string> = {}) => {
  const obj = key ? await files.get(key) : null

  if (!obj) return null

  return new Response(obj.body, {
    headers: { 'content-type': obj.httpMetadata?.contentType ?? 'application/octet-stream', 'cache-control': 'private, max-age=300', ...extraHeaders },
  })
}
