create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  token_id varchar(100) not null,
  refresh_token_id varchar(100) not null,
  revoked_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique(user_id, token_id),
  unique(user_id, refresh_token_id)
);
create index if not exists user_sessions_active_idx on public.user_sessions(user_id, revoked_at, expires_at);
