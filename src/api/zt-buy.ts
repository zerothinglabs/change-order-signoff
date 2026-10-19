import type { Context } from 'hono'
import { internalBuyPage } from '../first-party-proxy/internal-buy-page'
import { isInternal } from '../first-party-proxy/is-internal'
import type { Env } from '../types'
import { fetchCheckout } from './fetch-checkout'

export const ztBuy = async (c: Context<Env>) => {
  if (isInternal(c)) {
    c.header('cache-control', 'no-store')

    return c.html(internalBuyPage)
  }

  try {
    const res = await fetchCheckout(c)
    const location = res.headers.get('location')

    if (res.status >= 300 && res.status < 400 && location) return c.redirect(location, 302)

    return new Response(res.body, {
      status: res.status,
      headers: { 'content-type': res.headers.get('content-type') ?? 'text/plain', 'cache-control': 'no-store' },
    })
  } catch {
    return c.json({ error: 'checkout unavailable' }, 502)
  }
}
