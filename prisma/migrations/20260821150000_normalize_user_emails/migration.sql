-- Normalize stored emails and enforce case-insensitive uniqueness.
-- When duplicates exist for the same email (ignoring case), keep the highest-priority
-- account (ADMIN > MODERATOR > TEACHER > STUDENT), then the oldest row.

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY lower(trim(email))
      ORDER BY
        CASE role::text
          WHEN 'ADMIN' THEN 0
          WHEN 'MODERATOR' THEN 1
          WHEN 'TEACHER' THEN 2
          ELSE 3
        END,
        created_at ASC
    ) AS rn
  FROM users
  WHERE email IS NOT NULL AND trim(email) <> ''
)
DELETE FROM users
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

UPDATE users
SET email = lower(trim(email))
WHERE email IS NOT NULL AND email <> lower(trim(email));

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique
ON users (lower(email))
WHERE email IS NOT NULL;
