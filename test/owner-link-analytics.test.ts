import { describe, expect, it } from 'vitest'
import { readPublic, runScript } from './env'

const TOKEN = 'k'.repeat(43)
const PAGE = 'https://h.test/p/demo/app'

const classicScripts = (html: string) => [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]!)

const openDashboardBeforeAppModule = async () => {
  const sent: unknown[] = []
  const stored = new Map<string, string>()
  let url = new URL(PAGE + '#k=' + TOKEN)

  const location = {
    get href() { return url.href },
    get pathname() { return url.pathname },
    get search() { return url.search },
    get hash() { return url.hash },
  }

  const posthog = {
    __SV: 1,
    init: () => sent.push({ event: '$pageview', $current_url: location.href }),
    capture: (event: string) => sent.push({ event, $current_url: location.href }),
  }

  const sandbox: Record<string, unknown> = {
    URL,
    JSON,
    crypto,
    location,
    posthog,
    history: { replaceState: (_: unknown, __: string, next: string) => { url = new URL(next, url) } },
    localStorage: { getItem: (k: string) => stored.get(k) ?? null, setItem: (k: string, v: string) => stored.set(k, v) },
    navigator: { sendBeacon: (_: string, body: string) => sent.push(JSON.parse(body)) > 0 },
    fetch: async () => ({ json: async () => ({ slug: 'demo', ph: 'phc_test' }) }),
    addEventListener: () => {},
  }

  sandbox.window = sandbox

  for (const src of classicScripts(readPublic('app.html'))) {
    sandbox.document = { currentScript: { src: new URL(src, PAGE).href }, readyState: 'loading', referrer: '', addEventListener: () => {} }
    runScript(readPublic(src), sandbox)
  }

  await new Promise((r) => setTimeout(r, 0))

  return { sent, stored, href: location.href }
}

describe('owner link and analytics', () => {
  it('keeps the workspace key out of PostHog and hq events when the app module loads after zt.js has reported', async () => {
    const { sent, stored, href } = await openDashboardBeforeAppModule()

    expect(sent).toContainEqual({ event: '$pageview', $current_url: PAGE })
    expect(sent).toContainEqual(expect.objectContaining({ name: 'pageview', path: '/app' }))
    expect(JSON.stringify(sent)).not.toContain(TOKEN)
    expect(href).toBe(PAGE)
    expect(stored.get('ownerToken')).toBe(TOKEN)
  })
})
