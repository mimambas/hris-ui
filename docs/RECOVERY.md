# Recovery, Backup, and Continuity Runbook

Target: restore Supabase + Vercel within agreed RPO/RTO after data loss or bad migration.

## Current posture

- **Database:** Supabase PostgreSQL with WAL-based continuous archiving (PITR available on paid plans).
- **Application:** Vercel deployment; every `main` push rebuilds from GitHub, so the app is recoverable by redeploy.
- **Migrations:** ordered SQL files in `supabase/migrations/`; each `supabase db push` is versioned and replayable.
- **Secrets:** environment variables held in Vercel and Supabase dashboards; not stored in git.

## RPO / RTO targets

| Workload | RPO | RTO | Source |
|---|---|---|---|
| Supabase PostgreSQL | 5 minutes (PITR) | 60 minutes | Point-in-time recovery |
| Supabase object storage (documents) | 24 hours | 120 minutes | Bucket versioning/replication |
| Vercel app | 0 | 10 minutes | Redeploy last green SHA |
| Secrets | 0 | 30 minutes | Re-enter from password manager |

Targets are documented defaults; adjust with the business owner before enterprise launch.

## Backup verification cadence

1. Monthly: confirm PITR configuration and latest continuous archive.
2. Monthly: run a restore into a scratch Supabase project and verify row counts for `users`, `employees`, `payroll_entries`.
3. Quarterly: rehearse full Vercel recovery by redeploying a pinned SHA and running `npm run test:smoke`.
4. Record the result (date, duration, rows restored) in this file.

## Restore procedure — database

1. Identify the incident time in UTC (`<T`).
2. Create a new Supabase project (never restore over production first).
3. Restore PITR backup to `<T>` and wait for completion.
4. Run pending migrations:
   ```bash
   supabase db push --linked --workdir .
   ```
5. Verify: login, `/api/health`, `/api/employees?per_page=100`, and row counts match pre-incident.
6. Promote by repointing the application environment and rotating service-role key + JWT secret.
7. Post-incident: revoke all `user_sessions`, because tokens issued before restore may still validate.

## Restore procedure — application

```bash
git fetch --all
git checkout <last-green-sha>
vercel --cwd . --prod --yes
npm run test:smoke
```

The app requires no persistent local state; only environment variables must be present.

## Incident checklist

- [ ] Incident time recorded (UTC)
- [ ] Production environment backed up / PITR target chosen
- [ ] Scratch restore validated
- [ ] Row-count verification passed
- [ ] Secrets rotated
- [ ] Sessions revoked
- [ ] Smoke suite green
- [ ] This file updated with the drill result

## Drill log

| Date | Scope | Duration | Rows restored | Result |
|---|---|---|---|---|
| 2026-09-27 | Documentation + redeploy rehearsal (app only) | n/a | n/a | App recovery verified via `vercel --prod` + smoke suite |
| _pending_ | Full database PITR drill | | | |

## Known gaps

- PITR restore drill has not yet been executed against a scratch project.
- Document bucket has no versioning policy configured yet.
- No automated backup verification job; cadence is manual until CI coverage is added.
