import { expect } from 'vitest'
import { call } from './call'

export async function workspace() {
  const res = await call('/api/workspace', { method: 'POST', body: {} })

  expect(res.status).toBe(201)

  return (await res.json()) as { workspace_id: string; owner_token: string }
}
