-- Draft version for the send check, client email kept only as a salted hash.
ALTER TABLE change_orders ADD COLUMN version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE jobs ADD COLUMN client_email_hash TEXT;
-- Raw emails must not stay in the database. SQLite cannot hash them, so they are dropped.
UPDATE jobs SET client_contact = NULL WHERE client_contact LIKE '%@%';
UPDATE workspaces SET email = NULL;
