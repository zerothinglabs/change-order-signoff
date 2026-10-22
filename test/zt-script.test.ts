import { describe, expect, it } from 'vitest'
import { readPublic, runScript } from './env'

type Listener = (e: { target: unknown }) => void

const loadZt = () => {
  const beacons: { url: string; body: { name: string; path: string } }[] = []
  const clicks: Listener[] = []
  const buyLink = { href: '#pricing', getAttribute: () => 'monthly', closest: () => buyLink }

  const window: Record<string, unknown> = { addEventListener: () => {} }

  const document = {
    currentScript: { src: 'https://example.test/p/change-order-signoff/zt.js' },
    readyState: 'complete',
    referrer: '',
    querySelectorAll: () => [buyLink],
    addEventListener: (type: string, fn: Listener) => type === 'click' && clicks.push(fn),
  }

  const sandbox = {
    window,
    document,
    URL,
    JSON,
    crypto,
    location: { pathname: '/p/change-order-signoff/', href: 'https://example.test/p/change-order-signoff/?ref=selftest' },
    localStorage: { getItem: () => 'vid-1', setItem: () => {} },
    navigator: { sendBeacon: (url: string, body: string) => beacons.push({ url, body: JSON.parse(body) }) > 0 },
    fetch: async () => ({ json: async () => ({ slug: 'change-order-signoff', ph: '' }) }),
  }

  runScript(readPublic('zt.js'), sandbox)

  return { window, beacons, buyLink, click: () => clicks.forEach((fn) => fn({ target: buyLink })) }
}

describe('zt.js in a browser', () => {
  it('loads without throwing and exposes zt and zt.track', () => {
    const { window } = loadZt()

    expect(typeof window.zt).toBe('function')
    expect(typeof (window.zt as { track?: unknown }).track).toBe('function')
  })

  it('sends one pageview to zt/e on load', async () => {
    const { beacons } = loadZt()

    await new Promise((r) => setTimeout(r, 0))

    expect(beacons).toEqual([{ url: 'https://example.test/p/change-order-signoff/zt/e', body: expect.objectContaining({ name: 'pageview', path: '/' }) }])
  })

  it('turns buy links into zt/buy checkout links and sends buy_click on click', async () => {
    const { beacons, buyLink, click } = loadZt()

    expect(buyLink.href).toBe('https://example.test/p/change-order-signoff/zt/buy?plan=monthly&vid=vid-1')

    click()
    await new Promise((r) => setTimeout(r, 0))

    expect(beacons.map((b) => b.body.name)).toEqual(['pageview', 'buy_click'])
  })
})
