import { afterEach, describe, expect, it, vi } from 'vitest'
import app from '../src/index'

const env = { ZT_SLUG: 'demo', ZT_HQ_URL: 'https://hq.test/', ZT_POSTHOG_TOKEN: 'phc_test' }
const LOCAL_ORIGINS = ['http://localhost:8787', 'http://127.0.0.1:8787', 'http://[::1]:8787']

afterEach(() => vi.unstubAllGlobals())

function stubFetch(status: number, headers: Record<string, string> = {}) {
  const fn = vi.fn(() => Promise.resolve(new Response(null, { status, headers })))

  vi.stubGlobal('fetch', fn)

  return fn
}

describe('a local wrangler dev server', () => {
  it('keeps events away from hq and PostHog', async () => {
    const fn = stubFetch(204)

    for (const origin of LOCAL_ORIGINS) {
      expect((await app.request(`${origin}/zt/e`, { method: 'POST', body: '{}' }, env)).status).toBe(204)
      expect(await (await app.request(`${origin}/zt/ph/i/v0/e/?ip=0`, { method: 'POST', body: 'x' }, env)).json()).toEqual({ status: 1 })
    }

    expect(fn).not.toHaveBeenCalled()
  })

  it('still sends checkout to hq so a deploy check can follow the buy link', async () => {
    const fn = stubFetch(302, { location: 'https://pay.example/c/1' })
    const res = await app.request('http://localhost:8787/zt/buy?plan=monthly&vid=smoke', { headers: { 'user-agent': 'Bun/1.3.1' } }, env)

    expect(res.status).toBe(302)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
