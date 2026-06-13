-- CardioT alignment: batches, drip, hideFromStudents, USER -> STUDENT
--
-- IMPORTANT: If `prisma db push` fails on UserRole, run 01_rename_user_role.sql FIRST:
--   npx prisma db execute --schema prisma/schema.prisma --file prisma/migrations/20260418120000_cardiot_alignment/01_rename_user_role.sql
-- Then run `npx prisma db push` for the rest.

-- Rename UserRole enum value USER to STUDENT (skip if already STUDENT)
-- ALTER TYPE "UserRole" RENAME VALUE 'USER' TO 'STUDENT';
-- Class.hideFromStudents
ALTER TABLE "classes" ADD COLUMN IF NOT EXISTS "hide_from_students" BOOLEAN NOT NULL DEFAULT false;

-- User.batchId
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "batch_id" TEXT;

-- batches table
CREATE TABLE IF NOT EXISTS "batches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "classId" INTEGER NOT NULL,
    "teacherId" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "drip_start_date" TIMESTAMP(3),
    "is_drip_enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "batch_drip_configs" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "unlock_after_days" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_drip_configs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "batch_drip_configs_batch_id_subject_id_key" ON "batch_drip_configs"("batch_id", "subject_id");

-- UserActivity.batchId
ALTER TABLE "user_activities" ADD COLUMN IF NOT EXISTS "batch_id" TEXT;

-- Teacher M2M
CREATE TABLE IF NOT EXISTS "_TeacherBatches" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "_TeacherBatches_AB_unique" ON "_TeacherBatches"("A", "B");
CREATE INDEX IF NOT EXISTS "_TeacherBatches_B_index" ON "_TeacherBatches"("B");

-- Foreign keys (idempotent via DO blocks would be ideal; run once on deploy)
ALTER TABLE "batches" DROP CONSTRAINT IF EXISTS "batches_classId_fkey";
ALTER TABLE "batches" ADD CONSTRAINT "batches_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "batches" DROP CONSTRAINT IF EXISTS "batches_teacherId_fkey";
ALTER TABLE "batches" ADD CONSTRAINT "batches_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_batch_id_fkey";
ALTER TABLE "users" ADD CONSTRAINT "users_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "batch_drip_configs" DROP CONSTRAINT IF EXISTS "batch_drip_configs_batch_id_fkey";
ALTER TABLE "batch_drip_configs" ADD CONSTRAINT "batch_drip_configs_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "batch_drip_configs" DROP CONSTRAINT IF EXISTS "batch_drip_configs_subject_id_fkey";
ALTER TABLE "batch_drip_configs" ADD CONSTRAINT "batch_drip_configs_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_activities" DROP CONSTRAINT IF EXISTS "user_activities_batch_id_fkey";
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "_TeacherBatches" DROP CONSTRAINT IF EXISTS "_TeacherBatches_A_fkey";
ALTER TABLE "_TeacherBatches" ADD CONSTRAINT "_TeacherBatches_A_fkey" FOREIGN KEY ("A") REFERENCES "batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_TeacherBatches" DROP CONSTRAINT IF EXISTS "_TeacherBatches_B_fkey";
ALTER TABLE "_TeacherBatches" ADD CONSTRAINT "_TeacherBatches_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "user_activities_batch_id_created_at_idx" ON "user_activities"("batch_id", "created_at");
