import type { ContentfulStatusCode } from 'hono/utils/http-status'

export type Bindings = {
  ZT_SLUG: string
  ZT_HQ_URL: string
  ZT_POSTHOG_TOKEN?: string
  DB: D1Database
  FILES: R2Bucket
  ASSETS: Fetcher
}

export type Workspace = {
  id: string
  business_name: string | null
  license_no: string | null
  phone: string | null
  email: string | null
  logo_key: string | null
}

export type ChangeOrder = {
  id: string
  workspace_id: string
  job_id: string
  number: number
  title: string
  description: string | null
  items_json: string
  amount_cents: number
  days_impact: number
  payment_terms: string | null
  photo_count: number
  photos_json: string
  uploading: number
  uploading_until: string | null
  status: string
  sign_token: string | null
  snapshot_json: string | null
  snapshot_sha256: string | null
  sent_at: string | null
  created_at: string
  version: number
}

export type Env = { Bindings: Bindings; Variables: { ws: Workspace } }

export type Reply<Body> = { status: ContentfulStatusCode; body: Body }
