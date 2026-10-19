import type { Context } from 'hono'
import { isInternal } from '../is-internal'
import { fetchAsset } from './fetch-asset'
import { fetchIngest } from './fetch-ingest'

const PROXY_PREFIX = '/zt/ph'
const isAssetPath = (path: string) => path.startsWith('/static/') || path.startsWith('/array/')

export const posthog = async (c: Context) => {
  const url = new URL(c.req.url)
  const path = url.pathname.slice(url.pathname.indexOf(PROXY_PREFIX) + PROXY_PREFIX.length)
  const asset = isAssetPath(path)

  if (!asset && isInternal(c)) return c.json({ status: 1 })

  try {
    const res = asset ? await fetchAsset(c.req.raw, url, path) : await fetchIngest(c.req.raw, url, path)
    const out = new Response(res.body, res)

    out.headers.delete('set-cookie')

    return out
  } catch {
    return c.body(null, 502)
  }
}
