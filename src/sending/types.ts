import type { ChangeOrder, Workspace } from '../types'

export type SnapshotJob = { name: string; client_name: string; address: string | null; original_cents: number }

export type SnapshotInput = {
  ws: Workspace
  co: ChangeOrder
  job: SnapshotJob
  previousCents: number
  sentAt: string
  logoKey: string | null
}

export type FrozenRecord = { token: string; json: string; sha: string; sentAt: string }

export type Plan = { checked: boolean; paid: boolean }

export type FailReason = 'locked' | 'changed' | 'uploading' | 'free_limit'
