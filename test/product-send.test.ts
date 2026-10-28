import { describe, expect, it, vi } from 'vitest'
import app from '../src/index'
import { canonicalJson, sha256hex } from '../src/lib'
import { call } from './helpers/call'
import { co } from './helpers/co'
import { coBody } from './helpers/co-body'
import { job } from './helpers/job'
import { send } from './helpers/send'
import { sentCo } from './helpers/sent-co'
import { workspace } from './helpers/workspace'
import { installWorkerEnv } from './helpers/install-worker-env'
import { state } from './helpers/state'

installWorkerEnv()

describe('send', () => {
  it('409 when the draft changes between the read and the send, and the snapshot matches the ledger', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)
    const { id } = await co(t, jobId, { items: [{ desc: 'Paint', qty: 1, unit_cents: 10000 }] })
    const prepare = state.env.DB.prepare.bind(state.env.DB)
    let edited = false

    state.env.DB.prepare = ((sql: string) => {
      if (!edited && sql.includes("SET status = 'sent'")) {
        edited = true
        state.env.DB.raw.prepare("UPDATE change_orders SET amount_cents = 90000, version = version + 1 WHERE id = ?").run(id)
      }

      return prepare(sql)
    }) as typeof state.env.DB.prepare
    const res = await send(t, id)

    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: 'changed' })
    state.env.DB.prepare = prepare
    expect(state.env.DB.raw.prepare('SELECT status, snapshot_json FROM change_orders WHERE id = ?').get(id)).toEqual({ status: 'draft', snapshot_json: null })
  })

  it('an edit and a send at the same time never leave the snapshot and the ledger apart', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)
    const { id } = await co(t, jobId, { items: [{ desc: 'Paint', qty: 1, unit_cents: 10000 }] })

    const [s, e] = await Promise.all([
      send(t, id),
      call(`/api/co/${id}`, { token: t, method: 'PUT', body: coBody(jobId, { items: [{ desc: 'Paint', qty: 9, unit_cents: 10000 }] }) }),
    ])

    expect([s.status, e.status].filter((x) => x === 200).length).toBeGreaterThanOrEqual(1)
    const row = state.env.DB.raw.prepare('SELECT status, amount_cents, snapshot_json FROM change_orders WHERE id = ?').get(id)

    if (row.status === 'sent') expect(JSON.parse(row.snapshot_json).co.amount_cents).toBe(row.amount_cents)
    else expect(s.status).toBe(409)
  })

  it('locks the CO and hashes the canonical snapshot', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)
    const { id } = await sentCo(t, jobId)
    const put = await call(`/api/co/${id}`, { token: t, method: 'PUT', body: coBody(jobId) })

    expect(put.status).toBe(409)
    expect(await put.json()).toEqual({ error: 'locked' })
    const row = state.env.DB.raw.prepare('SELECT snapshot_json, snapshot_sha256, status, sign_token FROM change_orders WHERE id = ?').get(id)

    expect(row.status).toBe('sent')
    expect(row.sign_token).toMatch(/^[A-Za-z0-9_-]{32}$/)
    expect(row.snapshot_sha256).toBe(await sha256hex(row.snapshot_json))
    expect(canonicalJson(JSON.parse(row.snapshot_json))).toBe(row.snapshot_json)
    const snap = JSON.parse(row.snapshot_json)

    expect(snap.totals).toEqual({ previous_cents: 1000000, co_cents: 25000, new_cents: 1025000 })
    expect((await send(t, id)).status).toBe(409)
  })

  it('free: 4th send in a month returns 402 free_limit', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)

    for (let i = 0; i < 3; i++) await sentCo(t, jobId)
    const { id } = await co(t, jobId)
    const res = await send(t, id)

    expect(res.status).toBe(402)
    expect(await res.json()).toEqual({ error: 'free_limit' })
    expect(((await (await call('/api/workspace', { token: t })).json()) as { used_this_month: number }).used_this_month).toBe(3)
  })

  it('voided COs still count toward the limit', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)

    for (let i = 0; i < 3; i++) {
      const s = await sentCo(t, jobId)

      expect((await call(`/api/co/${s.id}/void`, { token: t, method: 'POST' })).status).toBe(200)
    }

    const { id } = await co(t, jobId)

    expect((await send(t, id)).status).toBe(402)
  })

  it('sends from last month do not count', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)

    for (let i = 0; i < 3; i++) await sentCo(t, jobId)
    state.env.DB.raw.prepare("UPDATE change_orders SET sent_at = '2000-01-15T00:00:00.000Z'").run()
    const { id } = await co(t, jobId)

    expect((await send(t, id)).status).toBe(200)
  })

  it('paid: 4th send succeeds', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)

    for (let i = 0; i < 3; i++) await sentCo(t, jobId)
    state.paid = true
    const { id } = await co(t, jobId)

    expect((await send(t, id)).status).toBe(200)
  })

  it('paid, 2 sent, no logo: two sends at once both count 2 sends, skip hq before either writes, and succeed', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)

    for (let i = 0; i < 2; i++) await sentCo(t, jobId)
    state.paid = true
    const a = await co(t, jobId)
    const b = await co(t, jobId)
    const res = await Promise.all([send(t, a.id), send(t, b.id)])

    expect(res.map((r) => r.status)).toEqual([200, 200])
    expect(((await (await call('/api/workspace', { token: t })).json()) as { used_this_month: number }).used_this_month).toBe(4)
  })

  it('free, 2 sent: of two sends at once, one gets 402 free_limit', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)

    for (let i = 0; i < 2; i++) await sentCo(t, jobId)
    const a = await co(t, jobId)
    const b = await co(t, jobId)
    const res = await Promise.all([send(t, a.id), send(t, b.id)])

    expect(res.map((r) => r.status).sort()).toEqual([200, 402])
  })

  it('only the x-zt-vid of this request counts, never the vid stored on the workspace', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)
    const asked: string[] = []

    vi.stubGlobal('fetch', async (url: string) => {
      asked.push(String(url))

      return Response.json({ active: String(url).endsWith('vid=vid-1') })
    })
    const other = { headers: { 'x-zt-vid': 'vid-2' } }

    expect((await call(`/api/pro/jobs/${jobId}/export.csv`, { token: t, ...other })).status).toBe(402)
    expect(((await (await call('/api/workspace', { token: t, ...other })).json()) as { paid: boolean }).paid).toBe(false)
    expect(asked.every((u) => u.endsWith('vid=vid-2'))).toBe(true)
    const noVid = await app.request(`/api/pro/jobs/${jobId}/export.csv`, { headers: { authorization: `Bearer ${t}` } }, state.env)

    expect(noVid.status).toBe(402)
    expect((await call(`/api/pro/jobs/${jobId}/export.csv`, { token: t })).status).toBe(200)
  })

  it('502 when hq is down and the free limit is reached', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)

    for (let i = 0; i < 3; i++) await sentCo(t, jobId)
    vi.stubGlobal('fetch', () => Promise.reject(new Error('down')))
    const { id } = await co(t, jobId)

    expect((await send(t, id)).status).toBe(502)
  })

  it('does not call hq for sends under the limit', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)

    await sentCo(t, jobId)
    expect(state.hqCalls).toBe(0)
  })
})

