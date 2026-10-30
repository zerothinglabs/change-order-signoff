import { describe, expect, it } from 'vitest'
import { readRoot } from './env'

const scripts = JSON.parse(readRoot('package.json')).scripts

describe('deploy script', () => {
  it('applies remote D1 migrations before wrangler deploy', () => {
    const steps = scripts.deploy.split(' && ')

    expect(steps[0]).toBe('wrangler d1 migrations apply change-order-signoff --remote')
    expect(steps[1]).toMatch(/^wrangler deploy /)
  })

  it('checks that POST /api/workspace returns 201 as an internal request', () => {
    const check = readRoot('scripts/check-deploy.sh')

    expect(scripts['check:deploy']).toBe('sh scripts/check-deploy.sh')
    expect(check).toContain('-X POST')
    expect(check).toContain('/api/workspace')
    expect(check).toContain('cookie: zt_internal=1')
    expect(check).toContain('!= 201')
  })
})
