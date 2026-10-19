CREATE TABLE workspaces (
  id TEXT PRIMARY KEY, owner_token_hash TEXT NOT NULL UNIQUE, vid TEXT,
  business_name TEXT, license_no TEXT, phone TEXT, email TEXT, logo_key TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE jobs (
  id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  name TEXT NOT NULL, client_name TEXT NOT NULL, client_contact TEXT, address TEXT,
  original_cents INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
);
CREATE INDEX jobs_ws ON jobs(workspace_id);
CREATE TABLE change_orders (
  id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, job_id TEXT NOT NULL REFERENCES jobs(id),
  number INTEGER NOT NULL,
  title TEXT NOT NULL, description TEXT, items_json TEXT NOT NULL,
  amount_cents INTEGER NOT NULL, days_impact INTEGER NOT NULL DEFAULT 0, payment_terms TEXT,
  photo_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  sign_token TEXT UNIQUE, snapshot_json TEXT, snapshot_sha256 TEXT,
  sent_at TEXT, created_at TEXT NOT NULL,
  UNIQUE(job_id, number)
);
CREATE INDEX co_ws_sent ON change_orders(workspace_id, sent_at);
CREATE TABLE signatures (
  change_order_id TEXT PRIMARY KEY REFERENCES change_orders(id),
  decision TEXT NOT NULL, signer_name TEXT NOT NULL, reason TEXT,
  ip TEXT, user_agent TEXT, signed_at TEXT NOT NULL,
  pdf_key TEXT NOT NULL, pdf_sha256 TEXT NOT NULL
);
