# CardioT ↔ TheoLingua Map

Dashboard, admin panel, and database alignment reference. Public/marketing pages are out of scope.

## Content hierarchy (shared)

| UI label | Prisma model | Table |
|----------|--------------|-------|
| Program | `Class` | `classes` |
| Unit | `Subject` | `subjects` |
| Chapter | `Chapter` | `chapters` |
| Topic | `Topic` | `topics` |
| Topic content | `TopicContent` | `topic_contents` |

## Dashboard routes

| Route | TheoLingua | CardioT | Notes |
|-------|------------|---------|-------|
| `/dashboard` | `app/dashboard/page.tsx` | same | Program list hub |
| `/dashboard/program/[slug]` | `app/dashboard/program/[slug]/page.tsx` | same | Learning view; drip UI after alignment |
| `/dashboard/profile` | yes | yes | Profile + password |
| `/dashboard/subscriptions` | yes | yes | Subscription management |
| `/dashboard/payments` | yes | yes | Payment history |
| `/dashboard/notifications` | yes (placeholder) | yes (placeholder) | Inbox stub |
| `/dashboard/settings` | yes | yes | Preferences UI |

## Admin routes

| Route | TheoLingua | CardioT | Status |
|-------|------------|---------|--------|
| `/admin` | yes | yes | Dashboard home |
| `/admin/batches` | yes (aligned) | yes | Batch CRUD |
| `/admin/batches/[id]/drip` | yes (aligned) | yes | Drip release config |
| `/admin/colleges` | yes (sidebar optional) | hidden in sidebar | School/college CRUD |
| `/admin/users` | yes | yes | User CRUD + batch assign |
| `/admin/users/[id]` | yes (aligned) | yes | Per-user analytics |
| `/admin/programs/...` | yes | yes | Full content tree |
| `/admin/pricing` | yes | hidden in sidebar | Pricing plans |
| `/admin/subscriptions` | yes | hidden | Subscriptions |
| `/admin/payments` | yes | hidden | Payments |
| `/admin/activities` | yes | yes | Activity logs |
| `/admin/notifications` | yes | hidden | Notifications |
| `/admin/announcements` | yes | hidden | Announcements |
| `/admin/error-logs` | yes | yes | Error logs |
| `/admin/responses` | yes | hidden | Form responses |
| `/admin/analytics` | yes | yes | Analytics (batch-scoped) |
| `/admin/roles` | yes (aligned) | yes | RBAC editor |
| `/admin/settings` | yes | yes | App settings + RBAC seed |
| `/admin/files` | yes | yes | File manager |

## Database models

### Identical (no structural change)

`Subject`, `Chapter`, `Topic`, `TopicContent`, `Account`, `Session`, `VerificationToken`, `UserTopicProgress`, `Subscription`, `Payment`, `FormResponse`, `AdminSettings`, `ContentPage`, `PricingPlan`, `Notification`, `NotificationQueue`, `Analytics`, `Announcement`, `School`, `TopicDifficultyRating`, `ErrorLog`, and shared enums except `UserRole`.

### Added in TheoLingua (from CardioT)

| Model / field | Purpose |
|---------------|---------|
| `Batch` | Cohort tied to a program; teachers + students |
| `BatchDripConfig` | Per-unit unlock delay for a batch |
| `Class.hideFromStudents` | Hide program from self-serve catalog |
| `Class.batches` | Program → batches |
| `Subject.dripConfigs` | Unit drip rules |
| `User.batchId` | Student batch membership |
| `User.teacherBatches` / `primaryBatches` | Teacher batch assignments |
| `UserActivity.batchId` | Activity scoped to batch |

### Role enum

| CardioT | TheoLingua (aligned) |
|---------|----------------------|
| `STUDENT` | `STUDENT` (was `USER`) |
| `ADMIN` | `ADMIN` |
| `TEACHER` | `TEACHER` |
| `MODERATOR` | `MODERATOR` |

## Auth / RBAC

| Area | CardioT | TheoLingua (aligned) |
|------|---------|----------------------|
| Admin access | ADMIN, TEACHER, MODERATOR | Same |
| Capability checks | `lib/auth-utils.ts` + `RBAC_CONFIG` in DB | Ported |
| Default learner role | STUDENT | STUDENT |
| Self-registration | Pre-provisioned only | Enabled (TheoLingua keeps signup) |

## Key lib files

| Purpose | TheoLingua |
|---------|------------|
| DB client | `lib/prisma.ts` |
| RBAC | `lib/rbac-config.ts`, `lib/auth-utils.ts` |
| Admin API guard | `lib/admin-auth.ts` |
| Drip access | `lib/drip-access.ts` |
| Subscriptions | `lib/subscription-utils.ts` |
