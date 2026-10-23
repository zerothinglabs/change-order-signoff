import { afterEach, describe, expect, it, vi } from 'vitest'
import app from '../src/index'

const env = { ZT_SLUG: 'demo', ZT_HQ_URL: 'https://hq.test/', ZT_POSTHOG_TOKEN: 'phc_test' }

afterEach(() => vi.unstubAllGlobals())

function mockHq(impl: (url: string) => Response | Promise<Response>) {
  const fn = vi.fn((url: string | URL | Request) => Promise.resolve(impl(String(url))))

  vi.stubGlobal('fetch', fn)

  return fn
}

describe('config and health', () => {
  it('serves /api/config with trimmed hq url', async () => {
    const res = await app.request('/api/config', {}, env)

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ slug: 'demo', hq: 'https://hq.test', ph: 'phc_test' })
  })

  it('serves an empty PostHog token when none is set', async () => {
    const res = await app.request('/api/config', {}, { ZT_SLUG: 'demo', ZT_HQ_URL: 'https://hq.test' })

    expect(((await res.json()) as { ph: string }).ph).toBe('')
  })

  it('serves /api/health', async () => {
    const res = await app.request('/api/health', {}, env)

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, slug: 'demo' })
  })
})

describe('/api/pro/example', () => {
  const req = (headers: Record<string, string> = {}) => app.request('/api/pro/example', { headers }, env)

  it('400 without x-zt-vid', async () => {
    const fn = mockHq(() => new Response('{}'))

    expect((await req()).status).toBe(400)
    expect(fn).not.toHaveBeenCalled()
  })

  it('200 when entitlement is active', async () => {
    const fn = mockHq(() => Response.json({ active: true, kind: 'monthly' }))
    const res = await req({ 'x-zt-vid': 'v1' })

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ ok: true, kind: 'monthly' })
    expect(fn.mock.calls[0]![0]).toBe('https://hq.test/v1/entitlement?slug=demo&vid=v1')
  })

  it('402 when not active', async () => {
    mockHq(() => Response.json({ active: false }))
    expect((await req({ 'x-zt-vid': 'v1' })).status).toBe(402)
  })

  it('502 when hq errors', async () => {
    mockHq(() => new Response('boom', { status: 500 }))
    expect((await req({ 'x-zt-vid': 'v1' })).status).toBe(502)
  })

  it('502 when hq is unreachable', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new Error('down')))
    expect((await req({ 'x-zt-vid': 'v1' })).status).toBe(502)
  })
})

describe('/zt/e proxy', () => {
  const send = (body: string) => app.request('/zt/e', { method: 'POST', body, headers: { 'content-type': 'text/plain;charset=UTF-8' } }, env)

  it('forwards the body as text/plain to hq /e', async () => {
    const fn = mockHq(() => new Response(null, { status: 204 }))
    const body = JSON.stringify({ slug: 'demo', name: 'pageview', visitor_id: 'v1' })
    const res = await send(body)

    expect(res.status).toBe(204)
    expect(fn.mock.calls[0]![0]).toBe('https://hq.test/e')
    const init = (fn.mock.calls[0] as unknown as [string, RequestInit])[1]

    expect(init.method).toBe('POST')
    expect(init.body).toBe(body)
    expect(new Headers(init.headers).get('content-type')).toBe('text/plain')
  })

  it('puts ?ref= or utm_source of the page into referrer', async () => {
    const fn = mockHq(() => new Response(null, { status: 204 }))
    const event = JSON.stringify({ slug: 'demo', name: 'pageview', referrer: 'https://t.co/x' })
    const fromPage = (page: string) => app.request('/zt/e', { method: 'POST', body: event, headers: { referer: page } }, env)
    const sentReferrer = (i: number) => JSON.parse(String((fn.mock.calls[i] as unknown as [string, RequestInit])[1].body)).referrer

    await fromPage('https://x.test/p/demo/?ref=reddit-gc')
    await fromPage('https://x.test/p/demo/pricing?utm_source=newsletter&utm_medium=email')
    await fromPage('https://x.test/p/demo/')
    expect([sentReferrer(0), sentReferrer(1), sentReferrer(2)]).toEqual(['reddit-gc', 'newsletter', 'https://t.co/x'])
  })

  it('passes hq errors through', async () => {
    mockHq(() => new Response('too big', { status: 413 }))
    expect((await send('x')).status).toBe(413)
  })

  it('502 when hq is unreachable', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new Error('down')))
    expect((await send('x')).status).toBe(502)
  })

  it('is POST only', async () => {
    mockHq(() => new Response(null, { status: 204 }))
    expect((await app.request('/zt/e', {}, env)).status).toBe(404)
  })
})

describe('/zt/buy proxy', () => {
  const buy = (qs = 'plan=one_time&vid=v1') => app.request(`/zt/buy?${qs}`, {}, env)

  it('302s to the hq checkout redirect', async () => {
    const fn = mockHq(() => new Response(null, { status: 302, headers: { location: 'https://pay.example/c/1' } }))
    const res = await buy()

    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('https://pay.example/c/1')
    expect(fn.mock.calls[0]![0]).toBe('https://hq.test/checkout/demo?plan=one_time&vid=v1')
    expect((fn.mock.calls[0] as unknown as [string, RequestInit])[1].redirect).toBe('manual')
  })

  it('always uses ZT_SLUG and encodes the query', async () => {
    const fn = mockHq(() => new Response(null, { status: 302, headers: { location: 'https://pay.example/c/1' } }))

    await buy('plan=monthly&vid=a%26b&slug=evil')
    expect(fn.mock.calls[0]![0]).toBe('https://hq.test/checkout/demo?plan=monthly&vid=a%26b')
  })

  it('passes hq errors through (503 when billing is not configured)', async () => {
    mockHq(() => Response.json({ error: 'billing is not configured' }, { status: 503 }))
    const res = await buy()

    expect(res.status).toBe(503)
    expect(await res.json()).toEqual({ error: 'billing is not configured' })
  })

  it('502 when hq is unreachable', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new Error('down')))
    expect((await buy()).status).toBe(502)
  })
})

describe('/zt/ph PostHog proxy', () => {
  const call = (fn: ReturnType<typeof mockHq>, i = 0) => fn.mock.calls[i] as unknown as [string, RequestInit]

  it('forwards ingest requests to us.i.posthog.com without cookies, with the client ip', async () => {
    const fn = mockHq(() => new Response('{"status":1}', { headers: { 'set-cookie': 'a=b', 'content-type': 'application/json' } }))

    const res = await app.request(
      '/zt/ph/e/?ip=0&ver=1',
      { method: 'POST', body: 'payload', headers: { cookie: 'x=1', authorization: 'Bearer t', 'cf-connecting-ip': '203.0.113.9' } },
      env,
    )

    expect(res.status).toBe(200)
    expect(res.headers.get('set-cookie')).toBeNull()
    expect(await res.text()).toBe('{"status":1}')
    const [url, init] = call(fn)

    expect(url).toBe('https://us.i.posthog.com/e/?ip=0&ver=1')
    expect(init.method).toBe('POST')
    expect(new TextDecoder().decode(init.body as ArrayBuffer)).toBe('payload')
    const h = new Headers(init.headers)

    expect(h.get('cookie')).toBeNull()
    expect(h.get('authorization')).toBeNull()
    expect(h.get('x-forwarded-for')).toBe('203.0.113.9')
  })

  it('sends GET without a body', async () => {
    const fn = mockHq(() => new Response('{}'))

    await app.request('/zt/ph/flags/?v=2', {}, env)
    expect(call(fn)[0]).toBe('https://us.i.posthog.com/flags/?v=2')
    expect(call(fn)[1].body).toBeNull()
  })

  it('serves /static and /array from the assets host', async () => {
    const fn = mockHq(() => new Response('js'))

    await app.request('/zt/ph/static/array.js', {}, env)
    await app.request('/zt/ph/array/phc_test/config.js', {}, env)
    expect(call(fn, 0)[0]).toBe('https://us-assets.i.posthog.com/static/array.js')
    expect(call(fn, 1)[0]).toBe('https://us-assets.i.posthog.com/array/phc_test/config.js')
  })

  it('forwards the origin to remote config (recording domains) and does not cache it', async () => {
    const fn = mockHq(() => new Response('{}'))

    await app.request('/zt/ph/array/phc_test/config', { headers: { origin: 'https://demo.zerothinglabs.com', cookie: 'x=1' } }, env)
    const init = call(fn)[1] as RequestInit & { cf?: unknown }

    expect(new Headers(init.headers).get('origin')).toBe('https://demo.zerothinglabs.com')
    expect(new Headers(init.headers).get('cookie')).toBeNull()
    expect(init.cache).toBe('no-store')
    expect(init.cf).toBeUndefined()
  })

  it('sends the page origin to remote config when the script tag sent none', async () => {
    const fn = mockHq(() => new Response('{}'))

    await app.request('https://demo.zerothinglabs.com/zt/ph/array/phc_test/config.js', {}, env)
    expect(new Headers(call(fn)[1].headers).get('origin')).toBe('https://demo.zerothinglabs.com')
  })

  it('502 when PostHog is unreachable', async () => {
    vi.stubGlobal('fetch', () => Promise.reject(new Error('down')))
    expect((await app.request('/zt/ph/e/', { method: 'POST', body: 'x' }, env)).status).toBe(502)
  })
})

describe('internal traffic', () => {
  const internal = { cookie: 'zt_internal=1' }

  it('zt/internal sets a long-lived cookie, and off=1 clears it', async () => {
    const on = await app.request('/zt/internal', {}, env)

    expect(on.status).toBe(200)
    const set = on.headers.get('set-cookie')!

    expect(set).toMatch(/^zt_internal=1;/)
    expect(set).toContain('Path=/')
    expect(set).toContain('Max-Age=34560000')
    expect(set).toContain('HttpOnly')
    expect(await on.text()).toContain('This browser is marked internal')
    const off = await app.request('/zt/internal?off=1', {}, env)

    expect(off.headers.get('set-cookie')).toMatch(/^zt_internal=;.*Max-Age=0/)
    expect(await off.text()).toContain('This browser counts again')
  })

  it('the page uses relative URLs only', async () => {
    const html = await (await app.request('/zt/internal', {}, env)).text()

    for (const m of html.match(/(?:href|src)="[^"]*"/g) ?? []) expect(m).not.toMatch(/="(\/|https?:)/)
  })

  it('/zt/e drops events from a marked browser and from headless Chrome', async () => {
    const fn = mockHq(() => new Response(null, { status: 204 }))
    const send = (headers: Record<string, string>) => app.request('/zt/e', { method: 'POST', body: '{}', headers }, env)

    expect((await send(internal)).status).toBe(204)
    expect((await send({ 'user-agent': 'Mozilla/5.0 HeadlessChrome/141.0.0.0 Safari/537.36' })).status).toBe(204)
    expect(fn).not.toHaveBeenCalled()
    await send({ cookie: 'zt_internal=0', 'user-agent': 'Mozilla/5.0 Chrome/141.0.0.0 Safari/537.36' })
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('the PostHog proxy drops ingest from a marked browser but still serves the script', async () => {
    const fn = mockHq(() => new Response('ok'))
    const res = await app.request('/zt/ph/i/v0/e/?ip=0', { method: 'POST', body: 'payload', headers: internal }, env)

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 1 })
    expect(fn).not.toHaveBeenCalled()
    expect((await app.request('/zt/ph/static/array.js', { headers: internal }, env)).status).toBe(200)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('/zt/buy never calls hq for a marked browser or headless Chrome', async () => {
    const fn = mockHq(() => new Response(null, { status: 302, headers: { location: 'https://pay.example/c/1' } }))
    const buy = (headers: Record<string, string>) => app.request('/zt/buy?plan=monthly&vid=v1', { headers }, env)

    for (const headers of [internal, { 'user-agent': 'Mozilla/5.0 HeadlessChrome/141.0.0.0 Safari/537.36' }]) {
      const res = await buy(headers)

      expect(res.status).toBe(200)
      const html = await res.text()

      expect(html).toContain('Checkout skipped')
      expect(html).toContain('href="internal?off=1"')
      for (const m of html.match(/(?:href|src)="[^"]*"/g) ?? []) expect(m).not.toMatch(/="(\/|https?:)/)
    }

    expect(fn).not.toHaveBeenCalled()
    expect((await buy({ cookie: 'zt_internal=0' })).status).toBe(302)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
