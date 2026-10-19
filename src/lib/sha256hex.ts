export const sha256hex = async (data: string | ArrayBuffer | Uint8Array): Promise<string> => {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data
  const digest = await crypto.subtle.digest('SHA-256', bytes)

  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
