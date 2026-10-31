import { PDFPage } from 'pdf-lib'
import { describe, expect, it, vi } from 'vitest'
import { MARGIN, PAGE_HEIGHT } from '../src/pdf/constants'
import { co } from './helpers/co'
import { job } from './helpers/job'
import { send } from './helpers/send'
import { sign } from './helpers/sign'
import { workspace } from './helpers/workspace'
import { PNG } from './helpers/fixtures'
import { installWorkerEnv } from './helpers/install-worker-env'

installWorkerEnv()

const COLD_PDF_TIMEOUT_MS = 15000

describe('signed PDF', () => {
  it('draws every line of a 100-line item description inside the page', async () => {
    const { owner_token: t } = await workspace()
    const jobId = await job(t)
    const desc = 'x\n'.repeat(100).trim()
    const { id } = await co(t, jobId, { items: [{ desc, qty: 1, unit_cents: 100 }] })
    const res = await send(t, id)
    const signToken = ((await res.json()) as { sign_url: string }).sign_url.split('/')[1]!
    const drawText = vi.spyOn(PDFPage.prototype, 'drawText')

    expect((await sign(signToken, { decision: 'approved', signer_name: 'Dana Ruiz', signature_png: PNG })).status).toBe(200)

    const ys = drawText.mock.calls.filter(([text]) => text === 'x').map(([, opts]) => opts!.y!)

    drawText.mockRestore()
    expect(desc.length).toBe(199)
    expect(ys.length).toBe(100)
    expect(ys.every((y) => y >= MARGIN && y <= PAGE_HEIGHT - MARGIN)).toBe(true)
  }, COLD_PDF_TIMEOUT_MS)
})
