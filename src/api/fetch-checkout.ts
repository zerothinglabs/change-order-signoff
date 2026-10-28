import type { Context } from 'hono'
import { sourceOf } from '../first-party-proxy/source-of'
import { hqUrl } from '../hq-url'
import type { Env } from '../types'

export const fetchCheckout = (c: Context<Env>) => {
  const query = new URLSearchParams({ plan: c.req.query('plan') ?? '', vid: c.req.query('vid') ?? '' })
  const source = sourceOf(c.req.header('referer'))

  if (source) query.set('ref', source)

  return fetch(`${hqUrl(c.env)}/checkout/${encodeURIComponent(c.env.ZT_SLUG)}?${query}`, {
    redirect: 'manual',
    headers: { 'user-agent': c.req.header('user-agent') ?? '' },
  })
}
