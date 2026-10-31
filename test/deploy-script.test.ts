import { describe, expect, it } from 'vitest'
import { readRoot } from './env'
import { runDeployCheck } from './helpers/run-deploy-check'

const scripts = JSON.parse(readRoot('package.json')).scripts
const TOKEN = 'a'.repeat(43)

describe('deploy script', () => {
  it('applies remote D1 migrations, deploys, then checks production', () => {
    const steps = scripts.deploy.split(' && ')

    expect(steps[0]).toBe('wrangler d1 migrations apply change-order-signoff --remote')
    expect(steps[1]).toMatch(/^wrangler deploy /)
    expect(steps[2]).toBe('sh scripts/check-deploy.sh https://change-order-signoff.zerothinglabs.com')
    expect(scripts['check:deploy']).toBe('sh scripts/check-deploy.sh')
  })

  it('passes when POST /api/workspace returns 201 with an owner_token, sent as internal traffic', async () => {
    const run = await runDeployCheck(201, JSON.stringify({ workspace_id: 'w1', owner_token: TOKEN }))

    expect(run.code).toBe(0)
    expect(run.requests).toEqual([{ method: 'POST', url: '/api/workspace', cookie: 'zt_internal=1' }])
  })

  it('fails when the status is not 201', async () => {
    const run = await runDeployCheck(404, JSON.stringify({ owner_token: TOKEN }))

    expect(run.code).toBe(1)
    expect(run.stderr).toContain('returned 404')
  })

  it('fails when the 201 reply has no owner_token', async () => {
    const run = await runDeployCheck(201, JSON.stringify({ workspace_id: 'w1' }))

    expect(run.code).toBe(1)
    expect(run.stderr).toContain('without an owner_token')
  })
})
