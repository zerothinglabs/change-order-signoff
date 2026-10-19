import { describe, expect, it } from 'vitest'
import app from '../src/index'
import { readPublic } from './env'
import { call } from './helpers/call'
import { installWorkerEnv } from './helpers/install-worker-env'
import { state } from './helpers/state'

installWorkerEnv()

describe('pages served by the worker', () => {
  it('/s/:token and /verify/:token serve their static page', async () => {
    expect(await (await call('/s/abc')).text()).toBe('asset /s/')
    expect(await (await call('/verify/abc')).text()).toBe('asset /verify/')
  })

  it('dashboard deep links load app.html with a base at the product root, on first open and on refresh, also under /p/<slug>/', async () => {
    state.env.ASSETS = { fetch: async (req: Request) => new URL(req.url).pathname === '/app' ? new Response(readPublic('app.html')) : new Response('nope', { status: 404 }) } as unknown as Fetcher

    for (const p of ['/app/job/abc', '/app/co/new?job=abc', '/app/co/abc', '/app/co/abc?edit=1']) {
      for (let i = 0; i < 2; i++) {
        const res = await app.request(`https://co.example${p}`, {}, state.env)

        expect(res.status, p).toBe(200)
        expect(res.headers.get('content-type'), p).toContain('text/html')
        const html = await res.text()

        expect(html, p).toContain('<head>\n  <base href="../../">')
        expect(html, p).toContain('<script type="module" src="js/app/index.js"></script>')
      }
    }

    expect(new URL('js/app/index.js', new URL('../../', 'https://h.test/p/demo/app/co/abc')).href).toBe('https://h.test/p/demo/js/app/index.js')
  })

  it('/sitemap.xml keeps the /p/<slug> prefix from x-zt-base and ignores a host in it', async () => {
    const xml = await (await app.request('https://h.test/sitemap.xml', { headers: { 'x-zt-base': '/p/demo/' } }, state.env)).text()

    expect(xml).toContain('<loc>https://h.test/p/demo/pricing</loc>')
    const evil = await (await app.request('https://h.test/sitemap.xml', { headers: { 'x-zt-base': 'https://evil.test' } }, state.env)).text()

    expect(evil).toContain('<loc>https://h.test/pricing</loc>')
  })

  it('/sitemap.xml lists the four public pages', async () => {
    const res = await app.request('https://co.example/sitemap.xml', {}, state.env)

    expect(res.headers.get('content-type')).toContain('application/xml')
    const xml = await res.text()

    for (const p of ['', 'pricing', 'change-order-form-template', 'guides/california-change-order-requirements']) {
      expect(xml).toContain(`<loc>https://co.example/${p}</loc>`)
    }
  })
})

