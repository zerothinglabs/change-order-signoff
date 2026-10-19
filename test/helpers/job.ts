import { expect } from 'vitest'
import { call } from './call'

export async function job(token: string, original = 1000000) {
  const res = await call('/api/jobs', { token, body: { name: 'Kitchen remodel', client_name: 'Dana Ruiz', address: '12 Oak St', original_cents: original } })

  expect(res.status).toBe(201)

  return ((await res.json()) as { id: string }).id
}
