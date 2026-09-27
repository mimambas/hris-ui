-- Worker identity is included in the function contract for audit/caller context;
-- the returned lease token is generated per row and is required for completion.
alter table public.notification_deliveries
  add column if not exists next_attempt_at timestamptz not null default now(),
  add column if not exists lease_token uuid,
  add column if not exists lease_owner uuid,
  add column if not exists lease_expires_at timestamptz,
  add column if not exists provider varchar(40),
  add column if not exists provider_message_id varchar(255),
  add column if not exists last_error_code varchar(80);

alter table public.email_outbox
  add column if not exists next_attempt_at timestamptz not null default now(),
  add column if not exists lease_token uuid,
  add column if not exists lease_owner uuid,
  add column if not exists lease_expires_at timestamptz,
  add column if not exists provider varchar(40),
  add column if not exists provider_message_id varchar(255),
  add column if not exists last_error_code varchar(80);

create index if not exists notification_deliveries_claim_idx
  on public.notification_deliveries(status, next_attempt_at, lease_expires_at)
  where status = 'pending';

create index if not exists email_outbox_claim_idx
  on public.email_outbox(status, next_attempt_at, lease_expires_at)
  where status = 'queued';

create unique index if not exists notification_deliveries_provider_message_idx
  on public.notification_deliveries(provider, provider_message_id)
  where provider_message_id is not null;

create unique index if not exists email_outbox_provider_message_idx
  on public.email_outbox(provider, provider_message_id)
  where provider_message_id is not null;

create or replace function public.claim_notification_deliveries(
  p_worker_id uuid,
  p_limit integer default 25,
  p_lease_seconds integer default 300
)
returns setof public.notification_deliveries
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with candidates as (
    select id
    from public.notification_deliveries
    where status = 'pending'
      and next_attempt_at <= now()
      and (lease_expires_at is null or lease_expires_at <= now())
    order by next_attempt_at, created_at
    for update skip locked
    limit greatest(1, least(p_limit, 100))
  )
  update public.notification_deliveries d
  set attempts = d.attempts + 1,
      lease_token = gen_random_uuid(),
      lease_owner = p_worker_id,
      lease_expires_at = now() + make_interval(secs => greatest(1, p_lease_seconds)),
      updated_at = now()
  from candidates
  where d.id = candidates.id
  returning d.*;
end;
$$;

create or replace function public.claim_email_outbox(
  p_worker_id uuid,
  p_limit integer default 25,
  p_lease_seconds integer default 300
)
returns setof public.email_outbox
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with candidates as (
    select id
    from public.email_outbox
    where status = 'queued'
      and next_attempt_at <= now()
      and (lease_expires_at is null or lease_expires_at <= now())
    order by next_attempt_at, created_at
    for update skip locked
    limit greatest(1, least(p_limit, 100))
  )
  update public.email_outbox e
  set attempts = e.attempts + 1,
      lease_token = gen_random_uuid(),
      lease_owner = p_worker_id,
      lease_expires_at = now() + make_interval(secs => greatest(1, p_lease_seconds)),
      updated_at = now()
  from candidates
  where e.id = candidates.id
  returning e.*;
end;
$$;

revoke all on function public.claim_notification_deliveries(uuid, integer, integer) from public, anon, authenticated;
revoke all on function public.claim_email_outbox(uuid, integer, integer) from public, anon, authenticated;
