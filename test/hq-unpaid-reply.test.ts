import { describe, expect, it } from 'vitest'
import { co } from './helpers/co'
import { installWorkerEnv } from './helpers/install-worker-env'
import { job } from './helpers/job'
import { moduleSource } from './helpers/module-source'
import { send } from './helpers/send'
import { sentCo } from './helpers/sent-co'
import { workspace } from './helpers/workspace'

installWorkerEnv()

type Fn = (...args: unknown[]) => unknown

const load = (file: string, name: string, deps: Record<string, unknown> = {}) =>
  new Function(...Object.keys(deps), `${moduleSource(file)}return ${name}`)(...Object.values(deps)) as Fn

describe('hq says the visitor has not bought ({ active: false, kind: null })', () => {
  it('the 4th send gets 402 free_limit and the page shows the buy link', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)

    for (let i = 0; i < 3; i++) await sentCo(t, jobId)

    const { id } = await co(t, jobId)
    const res = await send(t, id)
    const body = await res.json()

    expect(res.status).toBe(402)
    expect(body).toEqual({ error: 'free_limit' })

    const err = load('js/app/request-error.js', 'requestError')(res, body)
    const session = new Map<string, string>()
    const events: unknown[] = []

    const sendCo = load('js/app/send-co.js', 'sendCo', {
      api: () => Promise.reject(err),
      track: (name: unknown) => events.push(name),
      state: { ws: {} },
      amountBucket: () => '',
      trackActivated: () => Promise.resolve(),
      sessionStorage: { setItem: (k: string, v: string) => session.set(k, v) },
    })

    await expect(sendCo(id)).rejects.toBe(err)
    expect(session.get('limitHit')).toBe(id)
    expect(events).toEqual(['free_limit_hit'])

    const upgradeLink = load('js/app/upgrade-link.js', 'upgradeLink', { esc: load('js/shared/esc.js', 'esc') })
    const prompt = load('js/app/limit-prompt-html.js', 'limitPromptHtml', { state: { ws: { free_limit: 3 } }, upgradeLink })()

    expect(prompt).toContain('You used all 3 free change orders this month.')
    expect(prompt).toContain('data-zt-buy="monthly"')
  })
})
