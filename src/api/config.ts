import type { Context } from 'hono'
import { rememberSource } from '../first-party-proxy/remember-source'
import { hqUrl } from '../hq-url'
import type { Env } from '../types'

export const config = (c: Context<Env>) => {
  rememberSource(c)
  c.header('cache-control', 'no-store')

  return c.json({ slug: c.env.ZT_SLUG, hq: hqUrl(c.env), ph: c.env.ZT_POSTHOG_TOKEN ?? '' })
}
