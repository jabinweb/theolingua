-- Topic mastery / scoring for HTML activity auto-grading
ALTER TABLE "topics"
ADD COLUMN IF NOT EXISTS "requires_pass" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "mastery_score" INTEGER,
ADD COLUMN IF NOT EXISTS "max_attempts" INTEGER;

ALTER TABLE "user_topic_progress"
ADD COLUMN IF NOT EXISTS "best_score" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "last_score" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "attempt_count" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "topic_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "score" DOUBLE PRECISION,
    "max_score" DOUBLE PRECISION,
    "percent" DOUBLE PRECISION,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT,
    "raw_payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "topic_attempts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "topic_attempts_userId_topicId_attempt_number_key"
ON "topic_attempts"("userId", "topicId", "attempt_number");

CREATE INDEX IF NOT EXISTS "topic_attempts_userId_topicId_idx"
ON "topic_attempts"("userId", "topicId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'topic_attempts_topicId_fkey'
  ) THEN
    ALTER TABLE "topic_attempts"
    ADD CONSTRAINT "topic_attempts_topicId_fkey"
    FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'topic_attempts_userId_fkey'
  ) THEN
    ALTER TABLE "topic_attempts"
    ADD CONSTRAINT "topic_attempts_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
