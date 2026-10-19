import { uploadInFlight } from '../change-orders'
import { isPaid, PLAN_CHECK_FAILED } from '../entitlement'
import { errorReply } from '../error-reply'
import { now } from '../now'
import type { Bindings, ChangeOrder, Reply, Workspace } from '../types'
import { usedThisMonth } from '../workspace'
import { approvedCents } from './approved-cents'
import { buildSnapshot } from './build-snapshot'
import { failReason } from './fail-reason'
import { freezeCo, freezeLogo, freezeRecord } from './freeze'
import { loadSnapshotJob } from './load-snapshot-job'
import { lookupPlan } from './lookup-plan'

export const sendCo = async (
  env: Bindings,
  vid: string | undefined,
  ws: Workspace,
  co: ChangeOrder,
): Promise<Reply<{ sign_url: string } | { error: string }>> => {
  if (co.status !== 'draft') return errorReply(409, 'locked')
  if (uploadInFlight(co)) return errorReply(409, 'uploading')

  const plan = await lookupPlan(env, vid, ws, await usedThisMonth(env.DB, ws.id))

  if (!plan) return errorReply(502, PLAN_CHECK_FAILED)

  const job = await loadSnapshotJob(env.DB, co.job_id)
  const previousCents = job.original_cents + (await approvedCents(env.DB, co.job_id))
  const sentAt = now()
  const logoKey = plan.paid && ws.logo_key ? await freezeLogo(env.FILES, ws.logo_key, co.id) : null
  const frozen = await freezeRecord(buildSnapshot({ ws, co, job, previousCents, sentAt, logoKey }), sentAt)
  const freeze = (unlimited: boolean) => freezeCo(env.DB, co, ws.id, frozen, unlimited)

  let res = await freeze(plan.paid)

  if (!res.meta.changes && !plan.checked && (await failReason(env.DB, co)) === 'free_limit') {
    const paid = await isPaid(env, vid)

    if (paid === null) return errorReply(502, PLAN_CHECK_FAILED)
    if (paid) res = await freeze(true)
  }

  if (!res.meta.changes) {
    if (logoKey) await env.FILES.delete(logoKey)

    const reason = await failReason(env.DB, co)

    return errorReply(reason === 'free_limit' ? 402 : 409, reason)
  }

  return { status: 200, body: { sign_url: `s/${frozen.token}` } }
}
