import { afterEach, beforeEach, expect, vi } from 'vitest'
import { makeEnv } from '../env'
import { state } from './state'

export function installWorkerEnv() {
  beforeEach(() => {
    state.env = makeEnv()
    state.paid = false
    state.hqCalls = 0
    vi.stubGlobal('fetch', async (url: string) => {
      state.hqCalls++
      expect(String(url)).toMatch(/^https:\/\/hq\.test\/v1\/entitlement\?slug=demo&vid=/)

      return Response.json({ active: state.paid, kind: state.paid ? 'monthly' : null })
    })
  })

  afterEach(() => vi.unstubAllGlobals())
}
