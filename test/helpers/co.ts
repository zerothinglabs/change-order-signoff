import { expect } from 'vitest'
import { call } from './call'
import { coBody } from './co-body'

export async function co(token: string, jobId: string, extra = {}) {
  const res = await call('/api/co', { token, body: coBody(jobId, extra) })

  expect(res.status).toBe(201)

  return (await res.json()) as { id: string; number: number }
}
