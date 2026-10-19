import { describe, expect, it } from 'vitest'
import { emailHash } from '../src/jobs'
import { sha256hex } from '../src/lib'
import { call } from './helpers/call'
import { co } from './helpers/co'
import { coBody } from './helpers/co-body'
import { job } from './helpers/job'
import { send } from './helpers/send'
import { workspace } from './helpers/workspace'
import { installWorkerEnv } from './helpers/install-worker-env'
import { state } from './helpers/state'

installWorkerEnv()

describe('workspace', () => {
  it('returns an owner token and stores only its sha256', async () => {
    const ws = await workspace()

    expect(ws.owner_token).toMatch(/^[A-Za-z0-9_-]{43}$/)
    const row = state.env.DB.raw.prepare('SELECT * FROM workspaces WHERE id = ?').get(ws.workspace_id)

    expect(row.owner_token_hash).toBe(await sha256hex(ws.owner_token))
    expect(JSON.stringify(row)).not.toContain(ws.owner_token)
    expect(row.vid).toBe('vid-1')
  })

  it('reads, updates and clears the business profile', async () => {
    const { owner_token: t } = await workspace()
    const put = await call('/api/workspace', { token: t, method: 'PUT', body: { business_name: 'Oak Builders', license_no: 'CSLB 123456', phone: '555-0100', email: 'a@b.test' } })

    expect(put.status).toBe(200)
    const get = await call('/api/workspace', { token: t })

    expect(await get.json()).toEqual({
      business_name: 'Oak Builders', license_no: 'CSLB 123456', phone: '555-0100', email: 'a@b.test',
      logo_url: null, paid: false, used_this_month: 0, free_limit: 3,
    })
    await call('/api/workspace', { token: t, method: 'PUT', body: { business_name: 'Oak Builders' } })
    expect(((await (await call('/api/workspace', { token: t })).json()) as { email: string }).email).toBe('')
  })

  it('keeps the business email apart from client emails, which stay hashed', async () => {
    const { owner_token: t } = await workspace()

    await call('/api/workspace', { token: t, method: 'PUT', body: { email: 'owner@oak.test' } })
    await call('/api/jobs', { token: t, body: { name: 'Deck', client_name: 'Dana Ruiz', client_email: 'dana@home.test' } })
    expect(((await (await call('/api/workspace', { token: t })).json()) as { email: string }).email).toBe('owner@oak.test')
    const dump = JSON.stringify([state.env.DB.raw.prepare('SELECT * FROM workspaces').all(), state.env.DB.raw.prepare('SELECT * FROM jobs').all()])

    expect(dump).not.toContain('dana@home.test')
    expect(dump).toContain(await emailHash('demo', 'dana@home.test'))
    expect((await call('/api/workspace', { token: t, method: 'PUT', body: { email: 'not-an-email' } })).status).toBe(400)
    expect((await call('/api/workspace', { token: t, method: 'PUT', body: { email: 'a@b.test'.padStart(255, 'x') } })).status).toBe(400)
  })

  it('rejects over-long profile fields', async () => {
    const { owner_token: t } = await workspace()

    expect((await call('/api/workspace', { token: t, method: 'PUT', body: { business_name: 'x'.repeat(101) } })).status).toBe(400)
  })
})

describe('owner auth', () => {
  it('401 without or with a wrong token', async () => {
    for (const p of ['/api/workspace', '/api/jobs', '/api/jobs/x', '/api/co/x']) {
      expect((await call(p)).status).toBe(401)
      expect((await call(p, { token: 'nope' })).status).toBe(401)
    }

    expect((await call('/api/co', { body: {} })).status).toBe(401)
  })

  it("404 for another workspace's job and change order", async () => {
    const a = await workspace()
    const b = await workspace()
    const jobId = await job(a.owner_token)
    const { id } = await co(a.owner_token, jobId)
    const t = b.owner_token

    expect((await call(`/api/jobs/${jobId}`, { token: t })).status).toBe(404)
    expect((await call(`/api/co/${id}`, { token: t })).status).toBe(404)
    expect((await call(`/api/co/${id}`, { token: t, method: 'PUT', body: coBody(jobId) })).status).toBe(404)
    expect((await call(`/api/co/${id}`, { token: t, method: 'DELETE' })).status).toBe(404)
    expect((await send(t, id)).status).toBe(404)
    expect((await call(`/api/co/${id}/void`, { token: t, method: 'POST' })).status).toBe(404)
    expect((await call('/api/co', { token: t, body: coBody(jobId) })).status).toBe(404)
    expect(await (await call('/api/jobs', { token: t })).json()).toEqual([])
  })
})

