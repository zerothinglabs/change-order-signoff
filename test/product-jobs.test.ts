import { describe, expect, it } from 'vitest'
import { sha256hex } from '../src/lib'
import { call } from './helpers/call'
import { co } from './helpers/co'
import { coBody } from './helpers/co-body'
import { job } from './helpers/job'
import { sentCo } from './helpers/sent-co'
import { sign } from './helpers/sign'
import { workspace } from './helpers/workspace'
import { PNG } from './helpers/fixtures'
import { installWorkerEnv } from './helpers/install-worker-env'
import { state } from './helpers/state'

installWorkerEnv()

describe('jobs and change orders', () => {
  it('computes amount from items, including credits', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)
    const { id, number } = await co(t, jobId)

    expect(number).toBe(1)
    const row = state.env.DB.raw.prepare('SELECT amount_cents FROM change_orders WHERE id = ?').get(id)

    expect(row.amount_cents).toBe(25000)
    expect((await co(t, jobId)).number).toBe(2)
  })

  it('stores the client phone, and the client email only as a salted SHA-256', async () => {
    const { owner_token: t } = await workspace()
    const add = (body: Record<string, unknown>) => call('/api/jobs', { token: t, body: { name: 'Deck', client_name: 'Dana Ruiz', ...body } })
    const a = (await (await add({ client_contact: '555-0199', client_email: ' HomeOwner@Example.test ' })).json()) as { id: string }
    const b = (await (await add({ client_contact: 'homeowner@example.test' })).json()) as { id: string }
    const hash = await sha256hex('demo:homeowner@example.test')
    const row = (id: string) => state.env.DB.raw.prepare('SELECT client_contact, client_email_hash FROM jobs WHERE id = ?').get(id)

    expect(row(a.id)).toEqual({ client_contact: '555-0199', client_email_hash: hash })
    expect(row(b.id)).toEqual({ client_contact: null, client_email_hash: hash })
    expect(JSON.stringify(state.env.DB.raw.prepare('SELECT * FROM jobs').all()).toLowerCase()).not.toContain('homeowner@example.test')
    expect((await add({ client_email: 'not-an-email' })).status).toBe(400)
    expect((await add({ client_contact: 'a@b.test', client_email: 'c@d.test' })).status).toBe(400)
  })

  it('accepts quantities with up to 2 decimals and rejects more', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)

    for (const [qty, cents] of [[1.1, 1100], [1.12, 1120], [0.29, 290], [2.3, 2300]] as const) {
      const { id } = await co(t, jobId, { items: [{ desc: 'Tile', qty, unit_cents: 1000 }] })
      const row = state.env.DB.raw.prepare('SELECT amount_cents, items_json FROM change_orders WHERE id = ?').get(id)

      expect(row.amount_cents, String(qty)).toBe(cents)
      expect(JSON.parse(row.items_json)[0].qty).toBe(qty)
    }

    for (const qty of [1.123, 0.001, 2.305]) {
      expect((await call('/api/co', { token: t, body: coBody(jobId, { items: [{ desc: 'Tile', qty, unit_cents: 1000 }] }) })).status).toBe(400)
    }
  })

  it('validates change order input', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)

    const bad = [
      { title: '' },
      { items: [] },
      { items: Array.from({ length: 21 }, () => ({ desc: 'x', qty: 1, unit_cents: 1 })) },
      { items: [{ desc: 'x', qty: 0, unit_cents: 1 }] },
      { items: [{ desc: 'x', qty: 1, unit_cents: 1.5 }] },
      { days_impact: 366 },
      { days_impact: -366 },
      { payment_terms: 'x'.repeat(201) },
    ]

    for (const b of bad) expect((await call('/api/co', { token: t, body: coBody(jobId, b) })).status).toBe(400)
  })

  it('ledger: current total = original + approved, pending listed separately', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t, 1000000)
    const a = await sentCo(t, jobId)

    expect((await sign(a.signToken, { decision: 'approved', signer_name: 'Dana Ruiz', signature_png: PNG })).status).toBe(200)
    await sentCo(t, jobId)
    await co(t, jobId)
    const res = await call(`/api/jobs/${jobId}`, { token: t })
    const body = (await res.json()) as { totals: Record<string, number>; change_orders: { status: string }[] }

    expect(body.totals).toEqual({ original: 1000000, approved: 25000, pending: 25000, current: 1025000 })
    expect(body.change_orders.map((r) => r.status)).toEqual(['approved', 'sent', 'draft'])
    const list = (await (await call('/api/jobs', { token: t })).json()) as Record<string, number>[]

    expect(list[0]).toMatchObject({ original_cents: 1000000, approved_cents: 25000, pending_cents: 25000, current_total_cents: 1025000, pending_count: 1 })
  })

  it('edits and deletes drafts only', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)
    const d = await co(t, jobId)
    const put = await call(`/api/co/${d.id}`, { token: t, method: 'PUT', body: coBody(jobId, { items: [{ desc: 'x', qty: 1.5, unit_cents: 1000 }] }) })

    expect(put.status).toBe(200)
    expect(((await (await call(`/api/co/${d.id}`, { token: t })).json()) as { amount_cents: number }).amount_cents).toBe(1500)
    expect((await call(`/api/co/${d.id}`, { token: t, method: 'DELETE' })).status).toBe(204)
    const s = await sentCo(t, jobId)

    expect((await call(`/api/co/${s.id}`, { token: t, method: 'DELETE' })).status).toBe(409)
  })
})

