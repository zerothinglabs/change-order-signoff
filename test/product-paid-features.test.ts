import { describe, expect, it } from 'vitest'
import { blankPng } from './env'
import { call } from './helpers/call'
import { co } from './helpers/co'
import { job } from './helpers/job'
import { send } from './helpers/send'
import { sentCo } from './helpers/sent-co'
import { sign } from './helpers/sign'
import { workspace } from './helpers/workspace'
import { PNG, jpeg, pngBytes } from './helpers/fixtures'
import { installWorkerEnv } from './helpers/install-worker-env'
import { state } from './helpers/state'

installWorkerEnv()

describe('paid features', () => {
  const logoForm = (bytes: Uint8Array, type = 'image/png') => {
    const f = new FormData()

    f.append('file', new File([bytes], 'logo.png', { type }))

    return f
  }

  it('free: logo upload and CSV export return 402', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)
    const logo = await call('/api/workspace/logo', { token: t, form: logoForm(pngBytes()) })

    expect(logo.status).toBe(402)
    expect(await logo.json()).toEqual({ error: 'upgrade_required' })
    expect((await call(`/api/jobs/${jobId}/export.csv`, { token: t })).status).toBe(402)
  })

  it('paid: logo upload works and the logo goes on the signing page and PDF', async () => {
    state.paid = true
    const { owner_token: t, workspace_id } = await workspace()
    const res = await call('/api/workspace/logo', { token: t, form: logoForm(pngBytes()) })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ logo_url: 'api/workspace/logo' })
    expect(state.env.FILES.map.has(`logo/${workspace_id}`)).toBe(true)
    const img = await call('/api/workspace/logo', { token: t })

    expect(img.headers.get('content-type')).toBe('image/png')
    const ws = (await (await call('/api/workspace', { token: t })).json()) as { paid: boolean; logo_url: string }

    expect(ws).toMatchObject({ paid: true, logo_url: 'api/workspace/logo' })

    const jobId = await job(t)
    const { signToken } = await sentCo(t, jobId)
    const page = (await (await call(`/api/sign/${signToken}`, { headers: { 'x-zt-vid': 'someone-else' } })).json()) as { logo_url: string }

    expect(page.logo_url).toBe(`api/sign/${signToken}/logo`)
    expect((await call(`/api/sign/${signToken}/logo`)).status).toBe(200)
  })

  it('a new logo upload does not change change orders already sent', async () => {
    state.paid = true
    const { owner_token: t } = await workspace()

    await call('/api/workspace/logo', { token: t, form: logoForm(pngBytes()) })
    const jobId = await job(t)
    const { id, signToken } = await sentCo(t, jobId)
    const before = new Uint8Array(await (await call(`/api/sign/${signToken}/logo`)).arrayBuffer())

    expect(before).toEqual(pngBytes())
    await call('/api/workspace/logo', { token: t, form: logoForm(jpeg(), 'image/jpeg') })
    const after = await call(`/api/sign/${signToken}/logo`)

    expect(after.headers.get('content-type')).toBe('image/png')
    expect(new Uint8Array(await after.arrayBuffer())).toEqual(pngBytes())
    const snap = JSON.parse(state.env.DB.raw.prepare('SELECT snapshot_json FROM change_orders WHERE id = ?').get(id).snapshot_json)

    expect(snap.business.logo_key).toMatch(new RegExp(`^logo/co/${id}/`))
  })

  it('a send that loses the race (a JPEG logo upload and send B land before send A stores its PNG copy) does not change the logo of the send that won', async () => {
    state.paid = true
    const { owner_token: t } = await workspace()

    await call('/api/workspace/logo', { token: t, form: logoForm(pngBytes()) })
    const jobId = await job(t)
    const { id } = await co(t, jobId)
    const files = state.env.FILES
    const put = files.put.bind(files)
    let signToken = ''

    files.put = (async (...args: Parameters<typeof put>) => {
      if (args[0].startsWith(`logo/co/${id}/`) && !signToken) {
        signToken = 'pending'
        await call('/api/workspace/logo', { token: t, form: logoForm(jpeg(), 'image/jpeg') })
        const b = await send(t, id)

        expect(b.status).toBe(200)
        signToken = ((await b.json()) as { sign_url: string }).sign_url.split('/')[1]!
      }

      return put(...args)
    }) as typeof files.put
    expect((await send(t, id)).status).toBe(409)
    const logo = await call(`/api/sign/${signToken}/logo`)

    expect(logo.headers.get('content-type')).toBe('image/jpeg')
    expect(new Uint8Array(await logo.arrayBuffer())).toEqual(jpeg())
    const snap = JSON.parse(state.env.DB.raw.prepare('SELECT snapshot_json FROM change_orders WHERE id = ?').get(id).snapshot_json)

    expect([...files.map.keys()].filter((k) => k.startsWith(`logo/co/${id}/`))).toEqual([snap.business.logo_key])
  })

  it('rejects logos that are not PNG/JPEG or over 1 MB', async () => {
    state.paid = true
    const { owner_token: t } = await workspace()

    expect((await call('/api/workspace/logo', { token: t, form: logoForm(new TextEncoder().encode('hello')) })).status).toBe(400)
    const big = new Uint8Array(1024 * 1024 + 1)

    big.set(pngBytes())
    expect((await call('/api/workspace/logo', { token: t, form: logoForm(big) })).status).toBe(400)
  })

  it('rejects PNG logos over 4000 px per side or 4 megapixels without decoding them', async () => {
    const { owner_token: t } = await workspace()

    state.paid = true

    for (const [w, h] of [[10000, 10000], [4001, 10], [3000, 3000]] as const) {
      const png = blankPng(w, h)

      expect(png.length).toBeLessThan(200 * 1024)
      const res = await call('/api/workspace/logo', { token: t, form: logoForm(png) })

      expect(res.status, `${w}x${h}`).toBe(400)
    }

    expect((await call('/api/workspace/logo', { token: t, form: logoForm(blankPng(2000, 2000)) })).status).toBe(200)
  })

  it('free workspace: signing page has no logo even if one was stored', async () => {
    const { owner_token: t, workspace_id } = await workspace()

    state.env.DB.raw.prepare('UPDATE workspaces SET logo_key = ? WHERE id = ?').run(`logo/${workspace_id}`, workspace_id)
    const jobId = await job(t)
    const { signToken } = await sentCo(t, jobId)
    const page = (await (await call(`/api/sign/${signToken}`)).json()) as { logo_url: string | null }

    expect(page.logo_url).toBeNull()
  })

  it('paid: CSV export has the contract columns', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)
    const { signToken } = await sentCo(t, jobId)

    await sign(signToken, { decision: 'approved', signer_name: 'Dana Ruiz', signature_png: PNG })
    await co(t, jobId, { title: '=HYPERLINK("x")' })
    state.paid = true
    const res = await call(`/api/jobs/${jobId}/export.csv`, { token: t })

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/csv')
    const lines = (await res.text()).trim().split('\r\n')

    expect(lines[0]).toBe('co_number,title,status,amount_usd,days_impact,signer_name,signed_at')
    expect(lines[1]).toMatch(/^1,Add recessed lights,approved,250\.00,2,Dana Ruiz,\d{4}-\d\d-\d\dT/)
    expect(lines[2]).toBe(`2,"'=HYPERLINK(""x"")",draft,250.00,2,,`)
  })
})

