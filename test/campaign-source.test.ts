import { afterEach, describe, expect, it, vi } from 'vitest'
import app from '../src/index'

const env = { ZT_SLUG: 'demo', ZT_HQ_URL: 'https://hq.test/', ZT_POSTHOG_TOKEN: 'phc_test' }
const site = 'https://demo.zerothinglabs.com'
const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1'
const pageview = JSON.stringify({ slug: 'demo', name: 'pageview', visitor_id: 'v1', referrer: 'https://t.co/x' })

afterEach(() => vi.unstubAllGlobals())

function fakeHq() {
  const fn = vi.fn((url: string, _init?: RequestInit) => Promise.resolve(
    url.includes('/checkout/') ? new Response(null, { status: 302, headers: { location: 'https://pay.example/c/1' } }) : new Response(null, { status: 204 }),
  ))

  vi.stubGlobal('fetch', fn)

  const sent = () => fn.mock.calls.map(([url, init]) => (url.includes('/checkout/') ? url : JSON.parse(String(init?.body)).referrer))

  return { sent }
}

function visitor() {
  let cookie = ''

  const request = async (path: string, page: string, init: RequestInit = {}) => {
    const res = await app.request(`${site}${path}`, { ...init, headers: { 'user-agent': ua, referer: `${site}${page}`, cookie } }, env)
    const set = res.headers.get('set-cookie')

    if (set) cookie = set.split(';')[0]!

    return res
  }

  const open = async (page: string) => {
    await request('/api/config', page)
    await request('/zt/e', page, { method: 'POST', body: pageview })
  }

  return { open, buy: (page: string) => request('/zt/buy?plan=monthly&vid=v1', page), cookie: () => cookie }
}

describe('a visitor who lands on ?ref=batch-03', () => {
  it('keeps batch-03 on pricing, the dashboard and the upgrade link', async () => {
    const hq = fakeHq()
    const person = visitor()

    await person.open('/?ref=batch-03')
    await person.open('/pricing')
    await person.buy('/pricing')
    await person.open('/app')
    await person.open('/app/job/j1')
    await person.buy('/app/job/j1')
    expect(person.cookie()).toBe('zt_ref=batch-03')
    expect(hq.sent()).toEqual([
      'batch-03',
      'batch-03',
      'https://hq.test/checkout/demo?plan=monthly&vid=v1&ref=batch-03',
      'batch-03',
      'batch-03',
      'https://hq.test/checkout/demo?plan=monthly&vid=v1&ref=batch-03',
    ])
  })

  it('switches to a newer ref, and a ref on the page beats the saved one', async () => {
    const hq = fakeHq()
    const person = visitor()

    await person.open('/?ref=batch-03')
    await person.open('/?utm_source=newsletter')
    await person.open('/pricing')
    await person.buy('/pricing?ref=reddit-gc')
    expect(hq.sent()).toEqual(['batch-03', 'newsletter', 'newsletter', 'https://hq.test/checkout/demo?plan=monthly&vid=v1&ref=reddit-gc'])
  })

  it('saves the ref for 30 days in an HttpOnly cookie', async () => {
    const res = await app.request('/api/config', { headers: { referer: `${site}/?ref=batch-03` } }, env)
    const set = res.headers.get('set-cookie')!

    expect(set).toMatch(/^zt_ref=batch-03;/)
    expect(set).toContain('Path=/')
    expect(set).toContain('Max-Age=2592000')
    expect(set).toContain('HttpOnly')
    expect(await res.json()).toEqual({ slug: 'demo', hq: 'https://hq.test', ph: 'phc_test' })
  })
})

describe('a visitor with no ref', () => {
  it('gets no cookie and keeps the browser referrer', async () => {
    const hq = fakeHq()
    const person = visitor()

    await person.open('/')
    await person.open('/pricing')
    await person.buy('/pricing')
    expect(person.cookie()).toBe('')
    expect(hq.sent()).toEqual(['https://t.co/x', 'https://t.co/x', 'https://hq.test/checkout/demo?plan=monthly&vid=v1'])
  })
})
