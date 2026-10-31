import { describe, expect, it } from 'vitest'
import { call } from './helpers/call'
import { installWorkerEnv } from './helpers/install-worker-env'
import { job } from './helpers/job'
import { moduleSource } from './helpers/module-source'
import { workspace } from './helpers/workspace'

installWorkerEnv()

const DAYS_ERROR = 'Schedule impact must be a whole number of days from -365 to 365.'
const DEPS = ['document', 'track', 'coPath', 'fail', 'fieldValue', 'navigate', 'readItemRows', 'saveCo', 'sendCo', 'uploadPhotos']

const submitDays = (value: string, badInput = false) => {
  const bodies: Record<string, unknown>[] = []
  const msg = { innerHTML: '' }
  const fields: Record<string, unknown> = { 'c-title': { value: 'Move outlet' }, 'c-desc': { value: '' }, 'c-terms': { value: '' }, 'form-msg': msg }

  fields['c-days'] = { value, validity: { badInput }, focus: () => {} }

  const document = { getElementById: (id: string) => fields[id], querySelectorAll: () => [] }
  const fieldValue = (id: string) => (fields[id] as { value: string }).value
  const fail = (el: { innerHTML: string }, err: { message: string }) => (el.innerHTML = err.message)
  const readItemRows = () => [{ desc: 'Outlet', qty: 1, unit_cents: 9000 }]
  const saveCo = (_: unknown, body: Record<string, unknown>) => new Promise(() => bodies.push(body))
  const submitCoForm = new Function(...DEPS, moduleSource('js/app/submit-co-form.js') + 'return submitCoForm')(document, () => {}, () => '', fail, fieldValue, () => {}, readItemRows, saveCo, () => {}, () => {})

  submitCoForm({ preventDefault: () => {} }, { co: { job_id: 'j1' }, files: [] })

  return { body: bodies[0], msg: msg.innerHTML }
}

const saveDays = async (value: string) => {
  const { owner_token: token } = await workspace()
  const body = { ...submitDays(value).body, job_id: await job(token) }
  const res = await call('/api/co', { token, body })
  const data = (await res.json()) as { id?: string; error?: string }

  if (!data.id) return { status: res.status, error: data.error }

  const saved = (await (await call(`/api/co/${data.id}`, { token })).json()) as { days_impact: number }

  return { status: res.status, days: saved.days_impact }
}

describe('schedule impact input', () => {
  it('sends the typed days as is instead of truncating them', () => {
    for (const typed of ['1.5', '-0.5', '1e2', '']) expect(submitDays(typed).body?.days_impact).toBe(typed)
  })

  it('rejects fractional days instead of saving 1 or 0', async () => {
    for (const typed of ['1.5', '-0.5']) expect(await saveDays(typed), typed).toEqual({ status: 400, error: DAYS_ERROR })
  })

  it('reads exponent input as its full value, not its first digit', async () => {
    expect(await saveDays('1e2')).toEqual({ status: 201, days: 100 })
    expect(await saveDays('1e3')).toEqual({ status: 400, error: DAYS_ERROR })
  })

  it('saves a blank field as 0 days', async () => {
    expect(await saveDays('')).toEqual({ status: 201, days: 0 })
  })

  it('stops on text the browser cannot read as a number instead of sending 0', () => {
    expect(submitDays('', true)).toEqual({ body: undefined, msg: DAYS_ERROR })
  })
})
