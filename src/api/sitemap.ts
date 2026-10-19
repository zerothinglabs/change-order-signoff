import type { Context } from 'hono'
import { publicUrl } from '../public-url'
import { SITEMAP_PATHS, sitemapXml } from '../sitemap'
import type { Env } from '../types'

export const sitemap = (c: Context<Env>) =>
  c.body(sitemapXml(SITEMAP_PATHS.map((path) => publicUrl(c.req.raw, path))), 200, { 'content-type': 'application/xml; charset=utf-8' })
