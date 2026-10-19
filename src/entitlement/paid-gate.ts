import { errorReply } from '../error-reply'
import type { Bindings } from '../types'
import { PLAN_CHECK_FAILED, UPGRADE_REQUIRED } from './constants'
import { isPaid } from './is-paid'

export const paidGate = async (env: Bindings, vid: string | undefined) => {
  const paid = await isPaid(env, vid)

  if (paid === null) return errorReply(502, PLAN_CHECK_FAILED)

  return paid ? null : errorReply(402, UPGRADE_REQUIRED)
}
