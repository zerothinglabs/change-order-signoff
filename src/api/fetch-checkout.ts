import type { Context } from 'hono'
import { hqUrl } from '../hq-url'
import type { Env } from '../types'

export const fetchCheckout = (c: Context<Env>) => {
  const query = new URLSearchParams({ plan: c.req.query('plan') ?? '', vid: c.req.query('vid') ?? '' })

  return fetch(`${hqUrl(c.env)}/checkout/${encodeURIComponent(c.env.ZT_SLUG)}?${query}`, { redirect: 'manual' })
}
