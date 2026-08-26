CREATE TABLE IF NOT EXISTS anonymous_votes (
  voter_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  rank INTEGER NOT NULL CHECK(rank BETWEEN 0 AND 5),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (voter_id, person_id)
);

CREATE INDEX IF NOT EXISTS idx_anonymous_votes_person_rank
  ON anonymous_votes(person_id, rank);
