import { afterEach, describe, expect, it, vi } from 'vitest'
import app from '../src/index'

const env = { ZT_SLUG: 'demo', ZT_HQ_URL: 'https://hq.test/', ZT_POSTHOG_TOKEN: 'phc_test' }
const site = 'https://demo.zerothinglabs.com'

const AUTOMATED = [
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/141.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.0.0 Safari/537.36',
  'Mozilla/5.0 (compatible; UptimeRobot/2.0; http://www.uptimerobot.com/)',
  'curl/8.7.1',
  'Bun/1.3.1',
  '',
]

const PEOPLE = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-S921U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
]

afterEach(() => vi.unstubAllGlobals())

function stubFetch(status: number, headers: Record<string, string> = {}) {
  const fn = vi.fn(() => Promise.resolve(new Response(null, { status, headers })))

  vi.stubGlobal('fetch', fn)

  return fn
}

const event = (agent: string) => app.request(`${site}/zt/e`, { method: 'POST', body: '{}', headers: { 'user-agent': agent } }, env)
const ingest = (agent: string) => app.request(`${site}/zt/ph/i/v0/e/?ip=0`, { method: 'POST', body: 'x', headers: { 'user-agent': agent } }, env)

describe('bots, monitors and scripts', () => {
  it('never reach hq visitors', async () => {
    const fn = stubFetch(204)

    for (const agent of AUTOMATED) expect((await event(agent)).status).toBe(204)

    expect(fn).not.toHaveBeenCalled()
  })

  it('never reach PostHog', async () => {
    const fn = stubFetch(200)

    for (const agent of AUTOMATED) expect(await (await ingest(agent)).json()).toEqual({ status: 1 })

    expect(fn).not.toHaveBeenCalled()
  })

  it('still get the PostHog script, so pages load the same', async () => {
    const fn = stubFetch(200)

    expect((await app.request(`${site}/zt/ph/static/array.js`, { headers: { 'user-agent': 'curl/8.7.1' } }, env)).status).toBe(200)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('leave /zt/buy alone so the deploy smoke still gets its 302', async () => {
    const fn = stubFetch(302, { location: 'https://pay.example/c/1' })
    const res = await app.request(`${site}/zt/buy?plan=monthly&vid=smoke`, { headers: { 'user-agent': 'Bun/1.3.1' } }, env)

    expect(res.status).toBe(302)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('people in a browser', () => {
  it('still reach hq and PostHog', async () => {
    const fn = stubFetch(204)

    for (const agent of PEOPLE) {
      await event(agent)
      await ingest(agent)
    }

    expect(fn.mock.calls.map((call: unknown[]) => String(call[0]))).toEqual(
      PEOPLE.flatMap(() => ['https://hq.test/e', 'https://us.i.posthog.com/i/v0/e/?ip=0']),
    )
  })
})
