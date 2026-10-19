import { expect } from 'vitest'
import { co } from './co'
import { send } from './send'

export async function sentCo(token: string, jobId: string) {
  const { id } = await co(token, jobId)
  const res = await send(token, id)

  expect(res.status).toBe(200)
  const { sign_url } = (await res.json()) as { sign_url: string }

  return { id, signToken: sign_url.split('/')[1]! }
}
