# Product template

Starter for every zerothing product: a Hono Worker plus static assets, wired to hq for analytics,
checkout and entitlement. Created by `scripts/new-product.sh <slug> <dest>`, which fills in the slug and name.

## Layout

- `public/index.html` landing page. **Edit the content, keep the structure.**
- `public/style.css` design tokens and layout that follow `docs/design.md`. **Reuse its tokens and classes; do not restyle.**
- `public/privacy.html`, `public/terms.html` short, true defaults. **Fill in the contact email and refund policy.**
- `public/zt.js` beacon + buy links. **Do not change.**
- `src/index.ts` Worker routes: `/api/*` (**edit to add product features**) and the first-party proxies `/zt/e`, `/zt/buy`
  (**do not change**).
- `test/index.test.ts` Worker tests. **Extend for every route you add.**
- `wrangler.jsonc` config. `ZT_SLUG` and `ZT_HQ_URL` are vars. Keep the `assets` block, `run_worker_first: ["/api/*", "/zt/*"]` and `compatibility_flags: ["global_fetch_strictly_public"]` (without it, fetching hq on workers.dev fails with error 1042).

## What to edit

1. `public/index.html`: replace every `REPLACE` text and the `$0` prices. Keep the section order
   (header, hero with the real product, how it works, pricing, FAQ, footer). Put the working tool (or a real output)
   in the hero's `.frame`. Delete pricing cards for plans you do not sell. Prices must match the product's
   `pricing_json` in hq. Also replace `REPLACE` in `privacy.html` and `terms.html`.
2. `src/index.ts`: add product logic under `/api/...`. Paid features go under `/api/pro/...` and follow the
   `/api/pro/example` pattern (check entitlement with the visitor id from header `x-zt-vid`; return 402 if not active).
   The page sends the id with `localStorage.getItem('zt_vid')`.
3. Add static pages or assets in `public/`. Add more tools or UI there; no build step, no external CSS frameworks.

## Design

The look follows `docs/design.md` of the zerothing repo, plus the CEO corrections stored in hq (the develop loop appends
them to the guide in your prompt, and they override it). `public/style.css` already implements it: neutral palette with
one accent, system font, 14/16/20/30/44 px scale, light and dark tokens on `:root`, 16 px gutters, 44 px tap targets.

- Build product UI with the existing tokens (`var(--fg)`, `var(--muted)`, `var(--border)`, `var(--accent)`, ...) and
  classes (`.btn`, `.btn-outline`, `.card`, `.frame`, `.field`). Check it at 360 px wide and in dark mode.
- Show the real product in the hero, not an illustration. Screenshots: 2x, 1 px border, compressed.
- Never: gradients, glows, glassmorphism, stock or AI illustrations, emoji as icons, fake social proof, a second accent
  color, ALL CAPS sections, carousels or entrance animations, pricing tricks.
- Reviewers treat a design violation as a `major` finding. The first release of every product waits for the CEO's
  launch review (desktop and mobile screenshots plus all page copy) before it counts as live.

## Copy and voice

All text a person reads (landing page, UI strings, buttons, errors, emails, meta tags) follows the CEO's voice. The full
rules are in `docs/voice.md` of the zerothing repo, plus the CEO corrections from hq, which override them. The short version:

- Say the thing. No preamble, no recap, no closing summary.
- Short sentences, one idea each. Concrete: numbers, names, prices, steps. "Saves 10 minutes per invoice", not "streamlines your workflow".
- Plain words, like texting a busy peer. Claims must be true and checkable. No invented users, testimonials or stats.
- Never use: seamless, effortless, unlock, elevate, empower, supercharge, game-changer, revolutionize, cutting-edge, robust,
  leverage, delve, landscape, realm, journey, streamline, all-in-one, "take X to the next level".
- Never use: em dashes, emoji, exclamation marks, "not just X, but Y", "X isn't about A. It's about B.", rhetorical-question
  hooks, colon-reveal headlines, Title Case Everywhere, filler openers ("Great question", "Let's dive in").
- Reviewers reject copy that breaks these rules.

## What must stay

- `public/zt.js` and `<script src="zt.js"></script>` on every page. It reads `api/config`, sends `pageview` to the
  relative `zt/e`, and exposes `window.zt(name, props)` for custom events (for example `zt('signup', {source: 'hero'})`).
- Buy links: `<a data-zt-buy="one_time|monthly|yearly" href="#pricing">`. zt.js turns them into
  `zt/buy?plan=<plan>&vid=<zt_vid>` (relative to the script URL) and refreshes `vid` at click time. Do not hand-write the URL.
- First-party proxies in `src/index.ts`: `POST /zt/e` forwards the beacon body to `${ZT_HQ_URL}/e`; `GET /zt/buy`
  302s to the hq checkout (hq errors such as 503 pass through). Visitors never see the hq host, so ad blockers do not
  drop events. Never point the browser at `ZT_HQ_URL` directly.
- `/api/config` and `/api/health` routes.
- Relative URLs only (`zt.js`, `api/config`, `img/a.png`). Never start a URL with `/` and never hard-code a
  host. The product runs under `/p/<slug>/` before its domain is live and at its own domain (apex) after.
  Fetch from your own page with relative paths such as `fetch('api/pro/example')`.
- `ZT_SLUG` and `ZT_HQ_URL` vars. Do not add secrets to the repo.
- `pnpm verify` (typecheck + tests) must pass before you deploy.

## Commands

```
pnpm install
pnpm verify
pnpm dev                                                     # local preview
pnpm exec wrangler deploy --dispatch-namespace zt-products --name <slug>
```

After deploy, check `<dispatch-url>/p/<slug>/` (landing page) and `<dispatch-url>/p/<slug>/api/health` (200).
Set `ZT_HQ_URL` in `wrangler.jsonc` to the real hq URL before the production deploy.
