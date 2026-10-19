import { describe, expect, it } from 'vitest'
import { sha256hex } from '../src/lib'
import { blankPng, pdfText } from './env'
import { call } from './helpers/call'
import { co } from './helpers/co'
import { job } from './helpers/job'
import { send } from './helpers/send'
import { sign } from './helpers/sign'
import { workspace } from './helpers/workspace'
import { photoForm } from './helpers/photo-form'
import { PNG, jpeg, dataUrl } from './helpers/fixtures'
import { installWorkerEnv } from './helpers/install-worker-env'
import { state } from './helpers/state'

installWorkerEnv()

describe('signing', () => {
  async function setup(photos = 0) {
    const { owner_token: t } = await workspace()

    await call('/api/workspace', { token: t, method: 'PUT', body: { business_name: 'Oak Builders', license_no: 'CSLB 123456', phone: '555-0100', email: 'owner@b.test' } })
    const jobId = await job(t)
    const { id } = await co(t, jobId)

    for (let i = 0; i < photos; i++) await call(`/api/co/${id}/photos`, { token: t, form: photoForm(jpeg()) })
    const res = await send(t, id)
    const signToken = ((await res.json()) as { sign_url: string }).sign_url.split('/')[1]!

    return { t, jobId, id, signToken }
  }

  it('public snapshot has no owner email or ids', async () => {
    const { signToken } = await setup(2)
    const res = await call(`/api/sign/${signToken}`, { headers: {} })
    const body = (await res.json()) as { status: string; business: unknown; photos: unknown }

    expect(body.status).toBe('sent')
    expect(body.business).toEqual({ name: 'Oak Builders', license_no: 'CSLB 123456', phone: '555-0100' })
    expect(body.photos).toEqual([`api/sign/${signToken}/photo/1`, `api/sign/${signToken}/photo/2`])
    expect(JSON.stringify(body)).not.toContain('owner@b.test')
    expect((await call(`/api/sign/${signToken}/photo/2`)).status).toBe(200)
    expect((await call(`/api/sign/${signToken}/photo/3`)).status).toBe(404)
    expect((await call('/api/sign/nope')).status).toBe(404)
  })

  it('approve: PDF has signer, time, IP and snapshot hash; verify matches PDF bytes', async () => {
    const { t, id, signToken } = await setup(1)
    const res = await sign(signToken, { decision: 'approved', signer_name: 'Dana Ruiz', signature_png: PNG })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ pdf_url: `api/sign/${signToken}/pdf` })
    expect(((await (await call(`/api/co/${id}`, { token: t })).json()) as { status: string }).status).toBe('approved')
    expect([...state.env.FILES.map.keys()].filter((k) => k.startsWith(`sig/${id}/`)).length).toBe(1)

    const pdfRes = await call(`/api/sign/${signToken}/pdf`)

    expect(pdfRes.headers.get('content-type')).toBe('application/pdf')
    const bytes = new Uint8Array(await pdfRes.arrayBuffer())

    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-')
    const text = pdfText(bytes)
    const v = (await (await call(`/api/verify/${signToken}`)).json()) as Record<string, string>
    const snapSha = state.env.DB.raw.prepare('SELECT snapshot_sha256 FROM change_orders WHERE id = ?').get(id).snapshot_sha256

    expect(text).toContain('Signer: Dana Ruiz')
    expect(text).toContain(`Signed at (UTC): ${v.signed_at}`)
    expect(text).toContain('IP address: 203.0.113.7')
    expect(text).toContain(`Snapshot SHA-256: ${snapSha}`)
    expect(text).toContain('Decision: Approved')
    expect(text).toContain('Photo 1')
    expect(text.replace(/\n/g, ' ')).toContain(`Verify at http://localhost/verify/${signToken}`)
    expect(v).toEqual({
      number: 1, business_name: 'Oak Builders', job_name: 'Kitchen remodel', decision: 'approved', signer_name: 'Dana Ruiz',
      signed_at: v.signed_at, snapshot_sha256: snapSha, pdf_sha256: await sha256hex(bytes),
    })
    expect(v.signed_at).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/)
  })

  it('rejects a small signature PNG with huge dimensions before decoding it', async () => {
    const { signToken } = await setup()

    for (const [w, h] of [[10000, 10000], [3000, 3000]] as const) {
      const png = blankPng(w, h)

      expect(png.length).toBeLessThan(200 * 1024)
      const res = await sign(signToken, { decision: 'approved', signer_name: 'Dana Ruiz', signature_png: dataUrl(png) })

      expect(res.status, `${w}x${h}`).toBe(400)
    }

    const ok = await sign(signToken, { decision: 'approved', signer_name: 'Dana Ruiz', signature_png: dataUrl(blankPng(1200, 400)) })

    expect(ok.status).toBe(200)
  })

  it('second sign attempt returns 409', async () => {
    const { signToken } = await setup()

    expect((await sign(signToken, { decision: 'approved', signer_name: 'Dana Ruiz', signature_png: PNG })).status).toBe(200)
    expect((await sign(signToken, { decision: 'declined', signer_name: 'Dana Ruiz', signature_png: PNG })).status).toBe(409)
    expect((await call(`/api/sign/${signToken}`)).status).toBe(200)
  })

  it('PK on signatures blocks a duplicate even if status was not updated', async () => {
    const { id, signToken } = await setup()

    expect((await sign(signToken, { decision: 'approved', signer_name: 'Dana Ruiz', signature_png: PNG })).status).toBe(200)
    state.env.DB.raw.prepare("UPDATE change_orders SET status = 'sent' WHERE id = ?").run(id)
    expect((await sign(signToken, { decision: 'approved', signer_name: 'Dana Ruiz', signature_png: PNG })).status).toBe(409)
  })

  it('voided CO: 409 and withdrawn status', async () => {
    const { t, id, signToken } = await setup()

    expect((await call(`/api/co/${id}/void`, { token: t, method: 'POST' })).status).toBe(200)
    expect((await sign(signToken, { decision: 'approved', signer_name: 'Dana Ruiz', signature_png: PNG })).status).toBe(409)
    expect(((await (await call(`/api/sign/${signToken}`)).json()) as { status: string }).status).toBe('void')
  })

  it('void returns 409 once signed', async () => {
    const { t, id, signToken } = await setup()

    await sign(signToken, { decision: 'declined', signer_name: 'Dana Ruiz', signature_png: PNG })
    expect((await call(`/api/co/${id}/void`, { token: t, method: 'POST' })).status).toBe(409)
  })

  it('decline with reason: PDF says Declined, job total unchanged', async () => {
    const { t, jobId, id, signToken } = await setup()
    const res = await sign(signToken, { decision: 'declined', signer_name: 'Dana Ruiz', signature_png: PNG, reason: 'Too expensive right now.' })

    expect(res.status).toBe(200)
    expect(((await (await call(`/api/co/${id}`, { token: t })).json()) as { status: string }).status).toBe('declined')
    const text = pdfText(new Uint8Array(await (await call(`/api/sign/${signToken}/pdf`)).arrayBuffer()))

    expect(text).toContain('Decision: Declined')
    expect(text).toContain('Reason: Too expensive right now.')
    const j = (await (await call(`/api/jobs/${jobId}`, { token: t })).json()) as { totals: Record<string, number> }

    expect(j.totals).toEqual({ original: 1000000, approved: 0, pending: 0, current: 1000000 })
  })

  it('validates the signing request', async () => {
    const { signToken } = await setup()
    const pngSignatureBytesThenGarbage = 'data:image/png;base64,iVBORw0KGgoA'

    const bad = [
      { decision: 'maybe', signer_name: 'Dana Ruiz', signature_png: PNG },
      { decision: 'approved', signer_name: 'D', signature_png: PNG },
      { decision: 'approved', signer_name: 'x'.repeat(81), signature_png: PNG },
      { decision: 'approved', signer_name: 'Dana Ruiz' },
      { decision: 'approved', signer_name: 'Dana Ruiz', signature_png: 'data:image/png;base64,aGVsbG8=' },
      { decision: 'approved', signer_name: 'Dana Ruiz', signature_png: pngSignatureBytesThenGarbage },
      { decision: 'approved', signer_name: 'Dana Ruiz', signature_png: PNG.slice(0, -24) },
      { decision: 'approved', signer_name: 'Dana Ruiz', signature_png: 'data:image/png;base64,' + 'A'.repeat(300000) },
      { decision: 'declined', signer_name: 'Dana Ruiz', signature_png: PNG, reason: 'x'.repeat(501) },
    ]

    for (const b of bad) expect((await sign(signToken, b)).status, JSON.stringify(b).slice(0, 120)).toBe(400)
    expect((await call(`/api/verify/${signToken}`)).status).toBe(404)
    expect(((await (await call(`/api/sign/${signToken}`)).json()) as { status: string }).status).toBe('sent')
  })

  it('two signers at once: one wins, the stored PDF is the winner\'s, the loser removes its own files, and a later failed attempt leaves the PDF alone', async () => {
    const { id, signToken } = await setup()

    const [a, b] = await Promise.all([
      sign(signToken, { decision: 'approved', signer_name: 'Dana Ruiz', signature_png: PNG }),
      sign(signToken, { decision: 'declined', signer_name: 'Sam Ortiz', signature_png: PNG, reason: 'No.' }),
    ])

    expect([a.status, b.status].sort()).toEqual([200, 409])
    const rec = state.env.DB.raw.prepare('SELECT decision, signer_name, pdf_key, pdf_sha256 FROM signatures WHERE change_order_id = ?').get(id)
    const pdf = new Uint8Array(await (await call(`/api/sign/${signToken}/pdf`)).arrayBuffer())

    expect(await sha256hex(pdf)).toBe(rec.pdf_sha256)
    expect(pdfText(pdf)).toContain(`Signer: ${rec.signer_name}`)
    expect(state.env.DB.raw.prepare('SELECT status FROM change_orders WHERE id = ?').get(id).status).toBe(rec.decision)
    expect([...state.env.FILES.map.keys()].filter((k) => k.startsWith(`pdf/${id}/`))).toEqual([rec.pdf_key])
    expect((await sign(signToken, { decision: 'declined', signer_name: 'Sam Ortiz', signature_png: PNG })).status).toBe(409)
    expect(await sha256hex(new Uint8Array(await (await call(`/api/sign/${signToken}/pdf`)).arrayBuffer()))).toBe(rec.pdf_sha256)
  })

  it('PDF verify link keeps the /p/<slug> prefix from x-zt-base', async () => {
    const { signToken } = await setup()
    const res = await call(`/api/sign/${signToken}`, { body: { decision: 'approved', signer_name: 'Dana Ruiz', signature_png: PNG }, headers: { 'x-zt-base': '/p/demo' } })

    expect(res.status).toBe(200)
    const text = pdfText(new Uint8Array(await (await call(`/api/sign/${signToken}/pdf`)).arrayBuffer()))

    expect(text.replace(/\n/g, ' ')).toContain(`Verify at http://localhost/p/demo/verify/${signToken}`)
  })

  it('refuses to sign when a photo in the snapshot is missing', async () => {
    const { id, signToken } = await setup(2)
    const snap = JSON.parse(state.env.DB.raw.prepare('SELECT snapshot_json FROM change_orders WHERE id = ?').get(id).snapshot_json)

    state.env.FILES.map.delete(snap.photos[1])
    expect((await sign(signToken, { decision: 'approved', signer_name: 'Dana Ruiz', signature_png: PNG })).status).toBe(502)
    expect(state.env.DB.raw.prepare('SELECT status FROM change_orders WHERE id = ?').get(id).status).toBe('sent')
    expect(state.env.DB.raw.prepare('SELECT COUNT(*) AS n FROM signatures').get().n).toBe(0)
  })

  it('keeps names and addresses outside WinAnsi as typed in the PDF', async () => {
    const { owner_token: t } = await workspace()

    await call('/api/workspace', { token: t, method: 'PUT', body: { business_name: 'Trần Xây Dựng' } })
    const res = await call('/api/jobs', { token: t, body: { name: 'Bếp', client_name: 'Łukasz Żółć', address: '12 Đường Lê Lợi, Quận 1' } })
    const jobId = ((await res.json()) as { id: string }).id
    const { id } = await co(t, jobId, { title: 'Ремонт кухни' })
    const s = await send(t, id)
    const tok = ((await s.json()) as { sign_url: string }).sign_url.split('/')[1]!

    const nfdSignerNameAsSomePhoneKeyboardsSendIt = 'Nguyễn Văn An'.normalize('NFD')

    expect((await sign(tok, { decision: 'approved', signer_name: nfdSignerNameAsSomePhoneKeyboardsSendIt, signature_png: PNG })).status).toBe(200)
    const text = pdfText(new Uint8Array(await (await call(`/api/sign/${tok}/pdf`)).arrayBuffer()))

    for (const want of ['Trần Xây Dựng', 'Client: Łukasz Żółć', 'Address: 12 Đường Lê Lợi, Quận 1', 'Ремонт кухни', 'Signer: Nguyễn Văn An']) {
      expect(text, want).toContain(want)
    }

    expect(text).not.toContain('?')
  })

  it('keeps Chinese, Japanese and Korean text as typed in the PDF', async () => {
    const { owner_token: t } = await workspace()

    await call('/api/workspace', { token: t, method: 'PUT', body: { business_name: '陳氏裝修工程' } })
    const res = await call('/api/jobs', { token: t, body: { name: '廚房', client_name: '김민준', address: '東京都港区1-2-3' } })
    const jobId = ((await res.json()) as { id: string }).id
    const { id } = await co(t, jobId, { title: 'Tile – “shower” 浴室', description: '浴室磁磚全部更換，含防水層。\nLine two ✓' })
    const s = await send(t, id)
    const tok = ((await s.json()) as { sign_url: string }).sign_url.split('/')[1]!

    expect((await sign(tok, { decision: 'approved', signer_name: '王明', signature_png: PNG })).status).toBe(200)
    const text = pdfText(new Uint8Array(await (await call(`/api/sign/${tok}/pdf`)).arrayBuffer()))

    for (const want of [
      'Signer: 王明', '陳氏裝修工程', 'Job: 廚房', 'Client: 김민준', 'Address: 東京都港区1-2-3', 'Tile – “shower” 浴室',
      '浴室磁磚全部更換，含防水層。', 'Line two ✓',
    ]) {
      expect(text, want).toContain(want)
    }

    expect(text).not.toContain('?')
  })

  it('handles text outside the PDF font without failing', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)
    const { id } = await co(t, jobId, { title: 'Tile – “shower” 浴室', description: 'Line one\nLine two ✓' })
    const s = await send(t, id)
    const tok = ((await s.json()) as { sign_url: string }).sign_url.split('/')[1]!

    expect((await sign(tok, { decision: 'approved', signer_name: 'José Núñez', signature_png: PNG })).status).toBe(200)
    expect(pdfText(new Uint8Array(await (await call(`/api/sign/${tok}/pdf`)).arrayBuffer()))).toContain('Signer: José Núñez')
  })
})

