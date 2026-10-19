import { isPaid } from '../entitlement'
import { FREE_LIMIT } from '../lib'
import type { Bindings, Workspace } from '../types'
import { LOGO_URL } from './constants'
import { usedThisMonth } from './used-this-month'

export const workspaceView = async (env: Bindings, ws: Workspace, vid: string | undefined) => ({
  business_name: ws.business_name ?? '',
  license_no: ws.license_no ?? '',
  phone: ws.phone ?? '',
  email: ws.email ?? '',
  logo_url: ws.logo_key ? LOGO_URL : null,
  paid: (await isPaid(env, vid)) === true,
  used_this_month: await usedThisMonth(env.DB, ws.id),
  free_limit: FREE_LIMIT,
})
