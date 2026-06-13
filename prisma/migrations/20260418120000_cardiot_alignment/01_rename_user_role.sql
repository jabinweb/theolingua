-- Run this FIRST if prisma db push fails on UserRole USER -> STUDENT.
-- Safe to run: renames the enum label in PostgreSQL without recreating the type.

ALTER TYPE "UserRole" RENAME VALUE 'USER' TO 'STUDENT';
