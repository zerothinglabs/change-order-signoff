import { describe, expect, it } from 'vitest'
import { validateCo, type CoInput } from '../src/lib'
import { SITEMAP_PATHS } from '../src/sitemap'
import { listPublic, readPublic } from './env'

const fileServedForPath = (p: string) => (p === '' ? 'index.html' : `${p}.html`)
const NAME = 'SignedExtra'

const html = listPublic().filter((f) => f.endsWith('.html'))
const text = listPublic().filter((f) => /\.(html|js|css)$/.test(f) && f !== 'zt.js')
const moduleSource = (file: string) => readPublic(file).replace(/^import .*\n/gm, '').replace(/^export /gm, '')
const joinedSources = (dir: string) => listPublic(dir).map((f) => readPublic(f)).join('\n')
const siteSource = () => ['js/shared/track-page-leave.js', 'js/site/track-event-click.js', 'js/site/hold-buy-click.js', 'js/site/index.js'].map(moduleSource).join('\n')

describe('public pages', () => {
  it('the four SEO pages exist with a unique title, a meta description and one h1', () => {
    const titles = new Set<string>()

    for (const p of SITEMAP_PATHS) {
      const src = readPublic(fileServedForPath(p))
      const title = /<title>([^<]+)<\/title>/.exec(src)?.[1]

      expect(title, p).toBeTruthy()
      titles.add(title!)
      expect(src, p).toMatch(/<meta name="description" content="[^"]{50,}">/)
      expect(src.match(/<h1[\s>]/g)?.length, p).toBe(1)
    }

    expect(titles.size).toBe(SITEMAP_PATHS.length)
  })

  it('landing page uses the brand in the title and header and the value line as the h1', () => {
    const src = readPublic('index.html')

    expect(/<title>([^<]+)<\/title>/.exec(src)![1]).toContain(NAME)
    expect(/<a class="wordmark"[^>]*>([^<]+)<\/a>/.exec(src)![1]).toBe(NAME)
    expect(/<h1>([\s\S]*?)<\/h1>/.exec(src)![1]).toBe('Get the extra work signed before you start it.')
  })

  it('no public page, script or stylesheet contains Chinese text', () => {
    for (const f of text) expect(readPublic(f), f).not.toMatch(/[\u3400-\u9fff\uf900-\ufaff]/)
  })

  it('every page title carries the exact product name', () => {
    for (const f of html) expect(/<title>([^<]+)<\/title>/.exec(readPublic(f))?.[1], f).toContain(NAME)
  })

  it('every footer has only the contact email, Privacy and Terms links', () => {
    for (const f of html) {
      const footer = /<footer[\s\S]*?<\/footer>/.exec(readPublic(f))?.[0] ?? ''
      const depth = '../'.repeat(f.split('/').length - 1)

      expect(footer.match(/href="[^"]*"/g), f).toEqual([`href="mailto:support@zerothinglabs.com"`, `href="${depth}privacy.html"`, `href="${depth}terms.html"`])
    }
  })

  it('events go through zt.track, activated fires on the contractor send only, client content is masked in replays', () => {
    expect(readPublic('js/shared/track.js')).toContain('if (window.zt.track) return window.zt.track(name, props || {})')
    expect(joinedSources('js/sign/')).not.toContain("'activated'")
    expect(joinedSources('js/app/').match(/track\('activated'\)/g)).toHaveLength(1)
    expect(readPublic('js/app/track-activated.js')).toContain("track('activated')")
    expect(readPublic('js/sign/sign-form-html.js')).toMatch(/<canvas id="pad"[^>]*data-zt-private/)
    expect(readPublic('js/sign/photos-html.js')).toMatch(/class="photos ph-no-capture" data-zt-private/)
    expect(readPublic('zt.js')).toContain("ph.register({ product: c.slug })")
  })

  it('a failed detail read after send keeps the send a success', async () => {
    const src = moduleSource('js/app/send-co.js')
    const events: string[] = []
    const api = (path: string) => (path.endsWith('/send') ? Promise.resolve({ ok: true }) : Promise.reject(new Error('Request failed (500).')))
    const make = new Function('api', 'track', 'state', 'amountBucket', 'trackActivated', 'sessionStorage', src + 'return sendCo') as (...a: unknown[]) => (id: string) => Promise<unknown>
    const sendCo = make(api, (n: string) => events.push(n), { ws: { used_this_month: 0 } }, () => '<500', () => Promise.resolve(events.push('send_done')), { setItem() {} })

    await expect(sendCo('a')).resolves.toEqual({ ok: true })
    await expect(sendCo('b')).resolves.toEqual({ ok: true })
    expect(events).toEqual(['co_sent', 'send_done', 'co_sent', 'send_done'])
  })

  const loadActivated = (events: string[], win: { posthog?: { __loaded?: boolean } }) => {
    const store = new Map<string, string>()
    const session = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) }
    const waitForPosthog = new Function('window', moduleSource('js/app/wait-for-posthog.js') + 'return waitForPosthog')(win)
    const track = (n: string) => Promise.resolve(events.push(win.posthog?.__loaded ? n : `${n}:queued`))
    const trackActivated = new Function('track', 'waitForPosthog', 'sessionStorage', moduleSource('js/app/track-activated.js') + 'return trackActivated')(track, waitForPosthog, session) as () => Promise<void>

    return { trackActivated, store }
  }

  it('activated fires once per visit, on the first sent change order', async () => {
    const events: string[] = []
    const { trackActivated } = loadActivated(events, { posthog: { __loaded: true } })

    await trackActivated()
    await trackActivated()
    expect(events).toEqual(['activated'])
  })

  it('a slow PostHog load holds the send until activated reaches it, then the page moves on', async () => {
    const events: string[] = []
    const win: { posthog?: { __loaded?: boolean } } = { posthog: [] as unknown as { __loaded?: boolean } }
    const { trackActivated, store } = loadActivated(events, win)
    const api = (path: string) => Promise.resolve(path.endsWith('/send') ? { ok: true } : { amount_cents: 100 })
    const make = new Function('api', 'track', 'state', 'amountBucket', 'trackActivated', 'sessionStorage', moduleSource('js/app/send-co.js') + 'return sendCo') as (...a: unknown[]) => (id: string) => Promise<unknown>
    const sendCo = make(api, () => undefined, { ws: { used_this_month: 0 } }, () => '<500', trackActivated, { setItem() {} })
    const navigated = sendCo('a').then(() => events.push('navigate'))

    setTimeout(() => { win.posthog = { __loaded: true } }, 300)
    await new Promise((r) => setTimeout(r, 150))
    expect(events, 'no navigation while PostHog is still loading').toEqual([])
    expect(store.get('activated')).toBeUndefined()
    await navigated
    expect(events).toEqual(['activated', 'navigate'])
    expect(store.get('activated')).toBe('1')
  })

  it('when PostHog never loads, the send moves on after 1.5 s and activated stays unmarked for a retry', async () => {
    const events: string[] = []
    const { trackActivated, store } = loadActivated(events, {})
    const start = Date.now()

    await trackActivated()
    expect(Date.now() - start).toBeGreaterThanOrEqual(1500)
    expect(Date.now() - start).toBeLessThan(1700)
    expect(events).toEqual(['activated:queued'])
    expect(store.get('activated')).toBeUndefined()
  })

  it('the contractor phone link on the signing page is a 44 px tap target', () => {
    const head = new Function('esc', 'rel', moduleSource('js/sign/head-html.js') + 'return headHtml')((v: string) => v, (v: string) => v) as (d: unknown) => string

    expect(head({ business: { name: 'Ann Builds', phone: '(555) 010-0199' } })).toContain('<a class="link" href="tel:5550100199">(555) 010-0199</a>')
    expect(readPublic('style.css')).toMatch(/\.link \{[^}]*min-height: 44px/)
    expect(readPublic('app.css')).toContain('.sign-head .link { min-width: 44px; }')
  })

  it('every page with a script sends page_left with seconds on the page when it is hidden', () => {
    const events: [string, unknown][] = []
    const doc = { visibilityState: 'visible' }
    const leave = new Function('track', 'document', 'performance', moduleSource('js/shared/track-page-leave.js') + 'return trackPageLeave')((n: string, p: unknown) => events.push([n, p]), doc, { now: () => 42400 }) as () => void

    leave()
    doc.visibilityState = 'hidden'
    leave()
    expect(events).toEqual([['page_left', { seconds: 42 }]])

    for (const f of ['js/site/index.js', 'js/sign/index.js', 'js/verify/index.js']) expect(readPublic(f), f).toContain("addEventListener('visibilitychange', trackPageLeave)")
  })

  it('buy links wait for PostHog before leaving, so buy_click is sent', async () => {
    const listeners: ((e: unknown) => void)[] = []
    const win: { posthog?: { __loaded?: boolean } } = {}
    const loc = { href: 'start' }
    const doc = { addEventListener: (_t: string, fn: (e: unknown) => void) => listeners.push(fn) }

    new Function('document', 'window', 'location', siteSource())(doc, win, loc)
    const link = { href: 'zt/buy?plan=monthly&vid=v1' }

    const click = (o: Record<string, unknown> = {}) => {
      const e = { target: { closest: (s: string) => (s === 'a[data-zt-buy]' ? link : null) }, button: 0, defaultPrevented: false, prevented: false, preventDefault() { e.prevented = true }, ...o }

      for (const fn of listeners) fn(e)

      return e
    }

    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

    const posthogSnippetStub = [] as unknown as { __loaded?: boolean }

    win.posthog = posthogSnippetStub
    expect(click().prevented).toBe(true)
    await wait(120)
    expect(loc.href).toBe('start')
    win.posthog = { __loaded: true }
    await wait(250)
    expect(loc.href).toBe(link.href)

    expect(click().prevented, 'PostHog already loaded: the link works as is').toBe(false)
    expect(click({ metaKey: true }).prevented).toBe(false)

    loc.href = 'start'
    win.posthog = undefined
    click()
    await wait(1700)
    expect(loc.href, 'no PostHog at all: checkout still opens after 1.5 s').toBe(link.href)
  })

  it('the dashboard loads the site script after zt.js so its buy links get the same hold', () => {
    expect(readPublic('app.html')).toMatch(/<script src="zt.js"><\/script>\s*<script type="module" src="js\/app\/index.js"><\/script>\s*<script type="module" src="js\/site\/index.js"><\/script>/)
  })

  it('static page events prefer zt.track so they reach PostHog', () => {
    const js = readPublic('js/site/track-event-click.js')

    expect(js).toContain('if (window.zt.track) window.zt.track(name, props)')
    expect(js).toContain('else window.zt(name, props)')
  })

  it('the signing link share card is blocked from replay capture', () => {
    const card = /return '<div class="([^"]*)"([^>]*)><h2>Signing link<\/h2>/.exec(readPublic('js/app/sent-actions-html.js'))!

    expect(card[1]).toContain('ph-no-capture')
    expect(card[2]).toContain('data-zt-private')
  })

  it('live line amounts round like the server: quantity in hundredths first', () => {
    const lineCents = new Function(moduleSource('js/app/line-cents.js') + 'return lineCents')() as (q: number, u: number) => number
    const server = (qty: number, unit: number) => (validateCo({ title: 't', items: [{ desc: 'd', qty, unit_cents: unit }] }) as CoInput).items[0]!.line_cents

    expect(lineCents(0.29, 50)).toBe(15)
    for (const [q, u] of [[0.29, 50], [1.1, 1999], [2.3, 333], [0.07, -150], [12.5, 1], [3, 15000]] as const) expect(lineCents(q, u), `${q} x ${u}`).toBe(server(q, u))
    expect(readPublic('js/app/recalc-items.js')).toContain('lineCents(q, u)')
  })

  it('print styles make the blank form lines black', () => {
    const print = /@media print \{([\s\S]*?)\n\}/.exec(readPublic('app.css'))![1]!

    expect(print).toMatch(/\.form-sheet \{ --fg: #000; --muted: #000; --border: #000; \}/)
    expect(print).toContain('.form-sheet .blank i, .form-sheet .table th, .form-sheet .table td { border-color: #000; }')
  })

  it('the private dashboard link stays out of markup, autocapture and replay', () => {
    const card = readPublic('js/app/private-link-card.js')
    const wire = readPublic('js/app/wire-private-link.js')

    expect(card).toContain('class="card ph-no-capture" data-zt-private')
    expect(card).not.toMatch(/token|absoluteUrl\(|href=/)
    expect(wire).not.toMatch(/track\(|zt\(|posthog/)
    expect(joinedSources('js/app/')).not.toMatch(/track\([^)]*token/i)
  })

  it('each selected photo keeps one upload_id, sent with every try', () => {
    const up = readPublic('js/app/upload-photos.js')

    expect(readPublic('js/app/pick-photos.js')).toContain('form.files.forEach((f) => { f.uploadId = crypto.randomUUID() })')
    expect(up).toContain("fd.append('upload_id', files[0].uploadId)")
    expect(up).not.toMatch(/randomUUID|uploadId =/)
  })

  it('dashboard links use the /app paths, not hash routes', () => {
    const js = joinedSources('js/app/')

    expect(js).not.toMatch(/location\.hash\s*=|href="#/)
    for (const p of ["'app/job/'", "'app/co/'", 'app/co/new?job=']) expect(js).toContain(p)
  })

  it('every page loads zt.js with a relative URL', () => {
    for (const f of html) {
      const depth = f.split('/').length - 1

      expect(readPublic(f), f).toContain(`<script src="${'../'.repeat(depth)}zt.js"></script>`)
    }
  })

  it('no root-relative URLs and no absolute URLs except allowed external ones', () => {
    for (const f of text) {
      const src = readPublic(f)

      expect(src.match(/(?:href|src|action)=["']\/(?!\/)/g), f).toBeNull()
      expect(src.match(/fetch\(['"]\//g), f).toBeNull()
      const urls = src.match(/https?:\/\/[^\s"')]+/g) ?? []

      for (const u of urls) expect(u, f).toMatch(/^https:\/\/(california\.public\.law\/|www\.w3\.org\/)|^http:\/\/www\.w3\.org\//)
    }
  })

  it('buy buttons are zt.js monthly links only, never a hand-written checkout URL', () => {
    for (const f of text) {
      const src = readPublic(f)

      for (const m of src.match(/data-zt-buy="[^"]*"/g) ?? []) expect(m, f).toBe('data-zt-buy="monthly"')
      expect(src, f).not.toMatch(/checkout\//)
    }

    expect(readPublic('pricing.html')).toContain('data-zt-buy="monthly"')
    expect(readPublic('pricing.html')).toContain('$12')
  })

  it('no REPLACE left, no em dashes, no "legally binding" claims', () => {
    for (const f of text) {
      const src = readPublic(f)

      expect(src, f).not.toContain('REPLACE')
      expect(src, f).not.toContain('—')
      const binding = src.match(/legally binding[^<]*/gi) ?? []

      for (const b of binding) expect(b, f).toBe('legally binding?')
    }

    const faq = readPublic('index.html')

    expect(faq).toContain('Is this legally binding?')
    expect(faq).toContain('This is not legal advice.')
  })

  it('template page has a print button and the blank form fields', () => {
    const src = readPublic('change-order-form-template.html')

    expect(src).toContain('<h1>Free Change Order Form Template (Printable PDF)</h1>')
    expect(src).toContain('data-print')

    for (const f of ['Business name', 'License #', 'Change order #', 'Schedule impact', 'New contract total', 'Customer signature', 'Contractor signature']) {
      expect(src).toContain(f)
    }
  })

  it('California guide links the statute and says it is not legal advice', () => {
    const src = readPublic('guides/california-change-order-requirements.html')

    expect(src).toContain('<h1>California Change Order Requirements for Home Improvement (B&amp;P §7159)</h1>')
    expect(src).toContain('https://california.public.law/codes/business_and_professions_code_section_7159')
    expect(src).toContain('not legal advice')
  })

  it('signing page starts with Approve disabled and the withdrawn message exists', () => {
    const js = joinedSources('js/sign/')

    expect(js).toMatch(/id="approve" disabled/)
    expect(js).toContain('This change order was withdrawn by the contractor.')
    expect(js).toContain('I approve this change and agree to the amount of')
  })
})
