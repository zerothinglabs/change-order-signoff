import type { Context } from 'hono'
import { hqUrl } from '../hq-url'
import { isInternal } from '../first-party-proxy/is-internal'
import { isLocal } from '../first-party-proxy/is-local'
import { withPageSource } from '../first-party-proxy/with-page-source'
import type { Env } from '../types'

export const ztEvent = async (c: Context<Env>) => {
  if (isInternal(c) || isLocal(c)) return c.body(null, 204)

  try {
    const res = await fetch(`${hqUrl(c.env)}/e`, {
      method: 'POST',
      headers: { 'content-type': 'text/plain', 'user-agent': c.req.header('user-agent') ?? '' },
      body: withPageSource(await c.req.text(), c.req.header('referer')),
    })

    return new Response(null, { status: res.status })
  } catch {
    return c.body(null, 502)
  }
}
