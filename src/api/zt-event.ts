import type { Context } from 'hono'
import { hqUrl } from '../hq-url'
import { isInternal } from '../first-party-proxy/is-internal'
import type { Env } from '../types'

export const ztEvent = async (c: Context<Env>) => {
  if (isInternal(c)) return c.body(null, 204)

  try {
    const res = await fetch(`${hqUrl(c.env)}/e`, {
      method: 'POST',
      headers: { 'content-type': 'text/plain' },
      body: await c.req.text(),
    })

    return new Response(null, { status: res.status })
  } catch {
    return c.body(null, 502)
  }
}
