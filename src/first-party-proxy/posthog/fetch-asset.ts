const ASSETS_HOST = 'https://us-assets.i.posthog.com'
const FORWARDED_HEADERS = ['referer', 'user-agent']
const CACHE_STATIC_FILE = { cf: { cacheEverything: true } }
const NEVER_CACHE_REMOTE_CONFIG_KEYED_BY_ORIGIN = { cache: 'no-store' as const }

export const fetchAsset = (req: Request, url: URL, path: string) => {
  const originOrScriptTagPage = req.headers.get('origin') ?? url.origin
  const headers = new Headers({ origin: originOrScriptTagPage })

  for (const name of FORWARDED_HEADERS) {
    const value = req.headers.get(name)

    if (value) headers.set(name, value)
  }

  const cache = path.startsWith('/static/') ? CACHE_STATIC_FILE : NEVER_CACHE_REMOTE_CONFIG_KEYED_BY_ORIGIN

  return fetch(`${ASSETS_HOST}${path}${url.search}`, { headers, ...cache })
}
