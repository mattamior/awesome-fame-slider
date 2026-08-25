CREATE TABLE IF NOT EXISTS votes (
  x_user_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  rank INTEGER NOT NULL CHECK(rank BETWEEN 0 AND 5),
  post_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (x_user_id, person_id)
);

CREATE TABLE IF NOT EXISTS share_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  x_user_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  rank INTEGER NOT NULL CHECK(rank BETWEEN 0 AND 5),
  post_id TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_votes_person_rank ON votes(person_id, rank);
CREATE INDEX IF NOT EXISTS idx_share_person ON share_events(person_id);