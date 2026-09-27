
### 2026-09-27 — Notification queue contract

- Added tenant-scoped queue scheduling metadata and provider message fields for notification and bulk email outboxes.
- Added atomic PostgreSQL claim functions with `FOR UPDATE SKIP LOCKED` and lease expiry recovery.
- Retry now requeues notification delivery without claiming external delivery when no provider is configured.
- Added notification recipient organization validation and RLS defense for both outbox tables.


- Split pure authorization helpers into `src/lib/server/authorization.ts` so `auth.ts` re-exports them without DB/network imports; `requireUser` is unchanged.
- Added `scripts/test-authz.mjs`: super_admin/hr_director bypass, grant allow, deny matrix for HR-only permissions on the employee role, and two-organization tenant scoping assertions.
- Registered as `npm run test:authz`; typecheck, lint, build, and all smoke tests pass.

### 2026-09-27 — Notification queue contract

- Added tenant-scoped queue scheduling metadata and provider message fields for notification and bulk email outboxes.
- Added atomic PostgreSQL claim functions with `FOR UPDATE SKIP LOCKED` and lease expiry recovery.
- Retry now requeues notification delivery without claiming external delivery when no provider is configured.
- Added notification recipient organization validation and RLS defense for both outbox tables.
