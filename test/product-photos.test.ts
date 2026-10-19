import { describe, expect, it } from 'vitest'
import { pdfText } from './env'
import { call } from './helpers/call'
import { co } from './helpers/co'
import { job } from './helpers/job'
import { send } from './helpers/send'
import { sentCo } from './helpers/sent-co'
import { sign } from './helpers/sign'
import { workspace } from './helpers/workspace'
import { photoForm } from './helpers/photo-form'
import { PNG, jpeg, pngBytes } from './helpers/fixtures'
import { installWorkerEnv } from './helpers/install-worker-env'
import { state } from './helpers/state'

installWorkerEnv()

describe('photos', () => {
  it('accepts 4 JPEGs, rejects the 5th, big files and non-JPEGs', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)
    const { id } = await co(t, jobId)

    for (let n = 1; n <= 4; n++) {
      const res = await call(`/api/co/${id}/photos`, { token: t, form: photoForm(jpeg()) })

      expect(res.status).toBe(201)
      expect(await res.json()).toEqual({ n })
    }

    expect((await call(`/api/co/${id}/photos`, { token: t, form: photoForm(jpeg()) })).status).toBe(409)

    const other = await co(t, jobId)
    const big = new Uint8Array(2 * 1024 * 1024 + 1)

    big.set(jpeg())
    expect((await call(`/api/co/${other.id}/photos`, { token: t, form: photoForm(big) })).status).toBe(400)
    expect((await call(`/api/co/${other.id}/photos`, { token: t, form: photoForm(pngBytes()) })).status).toBe(400)
    expect((await call(`/api/co/${id}/photo/1`, { token: t })).headers.get('content-type')).toBe('image/jpeg')
  })

  it('409 after send', async () => {
    const { owner_token: t } = await workspace()
    const { id } = await sentCo(t, await job(t))

    expect((await call(`/api/co/${id}/photos`, { token: t, form: photoForm(jpeg()) })).status).toBe(409)
  })

  it('rejects files that are not complete JPEGs, without using a photo slot', async () => {
    const { owner_token: t } = await workspace()
    const { id } = await co(t, await job(t))
    const good = jpeg()

    const bad = [
      new Uint8Array([0xff, 0xd8, 0xff, 0x01]),
      good.slice(0, good.length - 10),
      new Uint8Array([...good.slice(0, good.length - 12), 0xff, 0xd9]),
      new Uint8Array([...good, 1, 2, 3]),
    ]

    for (const b of bad) expect((await call(`/api/co/${id}/photos`, { token: t, form: photoForm(b) })).status).toBe(400)
    const row = state.env.DB.raw.prepare('SELECT photo_count, photos_json, uploading FROM change_orders WHERE id = ?').get(id)

    expect(row).toEqual({ photo_count: 0, photos_json: '[]', uploading: 0 })
    expect(state.env.FILES.map.size).toBe(0)
    expect((await call(`/api/co/${id}/photos`, { token: t, form: photoForm(good) })).status).toBe(201)
  })

  it('a send while a photo is still uploading returns 409, and the photo is in the snapshot once stored', async () => {
    const { owner_token: t } = await workspace()
    const { id } = await co(t, await job(t))
    const put = state.env.FILES.put.bind(state.env.FILES)
    let finish!: () => void
    const r2WriteHeldOpen = new Promise<void>((r) => { finish = r })
    let stored!: () => void
    const started = new Promise<void>((r) => { stored = r })

    state.env.FILES.put = async (key: string, value: Uint8Array, o?: object) => {
      stored()
      await r2WriteHeldOpen

      return put(key, value, o)
    }

    const upload = call(`/api/co/${id}/photos`, { token: t, form: photoForm(jpeg()) })

    await started
    expect(state.env.DB.raw.prepare('SELECT photo_count FROM change_orders WHERE id = ?').get(id).photo_count).toBe(0)
    const early = await send(t, id)

    expect(early.status).toBe(409)
    expect(await early.json()).toEqual({ error: 'uploading' })
    finish()
    expect((await upload).status).toBe(201)
    state.env.FILES.put = put

    const res = await send(t, id)

    expect(res.status).toBe(200)
    const tok = ((await res.json()) as { sign_url: string }).sign_url.split('/')[1]!
    const snap = JSON.parse(state.env.DB.raw.prepare('SELECT snapshot_json FROM change_orders WHERE id = ?').get(id).snapshot_json)

    expect(snap.photos).toHaveLength(1)
    expect(state.env.FILES.map.has(snap.photos[0])).toBe(true)
    expect((await sign(tok, { decision: 'approved', signer_name: 'Dana Ruiz', signature_png: PNG })).status).toBe(200)
    expect(pdfText(new Uint8Array(await (await call(`/api/sign/${tok}/pdf`)).arrayBuffer()))).toContain('Photo 1')
  })

  it('a stale upload lease does not block the send forever', async () => {
    const { owner_token: t } = await workspace()
    const { id } = await co(t, await job(t))

    state.env.DB.raw.prepare("UPDATE change_orders SET uploading = 1, uploading_until = '2000-01-01T00:00:00.000Z' WHERE id = ?").run(id)
    expect((await send(t, id)).status).toBe(200)
  })

  it('an upload that outlives its lease and finishes after the send is not added, and its object is removed', async () => {
    const { owner_token: t } = await workspace()
    const { id } = await co(t, await job(t))
    const put = state.env.FILES.put.bind(state.env.FILES)

    state.env.FILES.put = async (key: string, value: Uint8Array, o?: object) => {
      state.env.DB.raw.prepare("UPDATE change_orders SET status = 'sent' WHERE id = ?").run(id)

      return put(key, value, o)
    }

    expect((await call(`/api/co/${id}/photos`, { token: t, form: photoForm(jpeg()) })).status).toBe(409)
    expect(state.env.DB.raw.prepare('SELECT photo_count, photos_json FROM change_orders WHERE id = ?').get(id)).toEqual({ photo_count: 0, photos_json: '[]' })
    expect([...state.env.FILES.map.keys()].filter((k) => k.startsWith('photo/'))).toEqual([])
  })

  it('a retry after the response was lost returns the first result and adds no copy, the other photos still fit, and a late retry gets its result, not photo_limit', async () => {
    const { owner_token: t } = await workspace()
    const { id } = await co(t, await job(t))
    const photoKeys = () => [...state.env.FILES.map.keys()].filter((k) => k.startsWith(`photo/${id}/`))
    const firstWithLostResponse = await call(`/api/co/${id}/photos`, { token: t, form: photoForm(jpeg(), 'upload-aaaa-1') })

    expect(firstWithLostResponse.status).toBe(201)
    expect(await firstWithLostResponse.json()).toEqual({ n: 1 })
    const retry = await call(`/api/co/${id}/photos`, { token: t, form: photoForm(jpeg(), 'upload-aaaa-1') })

    expect(retry.status).toBe(200)
    expect(await retry.json()).toEqual({ n: 1 })
    expect(state.env.DB.raw.prepare('SELECT photo_count, uploading FROM change_orders WHERE id = ?').get(id)).toEqual({ photo_count: 1, uploading: 0 })
    expect(photoKeys()).toHaveLength(1)

    for (let n = 2; n <= 4; n++) {
      const res = await call(`/api/co/${id}/photos`, { token: t, form: photoForm(jpeg(), `upload-bbbb-${n}`) })

      expect(await res.json()).toEqual({ n })
    }

    const lateRetryWithAllPlacesUsed = await call(`/api/co/${id}/photos`, { token: t, form: photoForm(jpeg(), 'upload-bbbb-3') })

    expect(lateRetryWithAllPlacesUsed.status).toBe(200)
    expect(await lateRetryWithAllPlacesUsed.json()).toEqual({ n: 3 })
    expect(photoKeys()).toHaveLength(4)
  })

  it('two parallel uploads with the same upload_id store one photo', async () => {
    const { owner_token: t } = await workspace()
    const { id } = await co(t, await job(t))
    const put = state.env.FILES.put.bind(state.env.FILES)
    let finish!: () => void
    const gate = new Promise<void>((r) => { finish = r })
    let calls = 0
    let bothStarted!: () => void
    const started = new Promise<void>((r) => { bothStarted = r })

    state.env.FILES.put = async (key: string, value: Uint8Array, o?: object) => {
      if (++calls === 2) bothStarted()

      await gate

      return put(key, value, o)
    }

    const a = call(`/api/co/${id}/photos`, { token: t, form: photoForm(jpeg(), 'upload-cccc-1') })
    const b = call(`/api/co/${id}/photos`, { token: t, form: photoForm(jpeg(), 'upload-cccc-1') })

    await started
    finish()
    const res = await Promise.all([a, b])

    state.env.FILES.put = put
    expect(res.map((r) => r.status).sort()).toEqual([200, 201])
    for (const r of res) expect(await r.json()).toEqual({ n: 1 })
    expect(state.env.DB.raw.prepare('SELECT photo_count, uploading FROM change_orders WHERE id = ?').get(id)).toEqual({ photo_count: 1, uploading: 0 })
    expect([...state.env.FILES.map.keys()].filter((k) => k.startsWith(`photo/${id}/`))).toHaveLength(1)
  })

  it('rejects a malformed upload_id', async () => {
    const { owner_token: t } = await workspace()
    const { id } = await co(t, await job(t))

    for (const bad of ['short', 'has space in it', '../../etc/passwd', 'x'.repeat(65)]) {
      expect((await call(`/api/co/${id}/photos`, { token: t, form: photoForm(jpeg(), bad) })).status).toBe(400)
    }

    expect(state.env.DB.raw.prepare('SELECT photo_count FROM change_orders WHERE id = ?').get(id).photo_count).toBe(0)
  })
})

