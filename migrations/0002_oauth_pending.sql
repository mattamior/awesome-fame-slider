CREATE TABLE IF NOT EXISTS oauth_pending (
  state TEXT PRIMARY KEY,
  code_verifier TEXT NOT NULL,
  person_id TEXT NOT NULL,
  rank INTEGER NOT NULL CHECK(rank BETWEEN 0 AND 5),
  media_base64 TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_oauth_pending_expires ON oauth_pending(expires_at);
