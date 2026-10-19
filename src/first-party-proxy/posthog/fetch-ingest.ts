const INGEST_HOST = 'https://us.i.posthog.com'
const PRIVATE_HEADERS = ['cookie', 'authorization', 'host']

export const fetchIngest = async (req: Request, url: URL, path: string) => {
  const headers = new Headers(req.headers)

  for (const name of PRIVATE_HEADERS) headers.delete(name)
  headers.set('x-forwarded-for', req.headers.get('cf-connecting-ip') ?? '')

  const body = req.method === 'GET' || req.method === 'HEAD' ? null : await req.arrayBuffer()

  return fetch(`${INGEST_HOST}${path}${url.search}`, { method: req.method, headers, body })
}
