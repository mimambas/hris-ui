create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  notification_id uuid not null references public.notifications(id) on delete cascade,
  channel varchar(30) not null default 'in_app' check (channel in ('in_app','email','sms')),
  status varchar(20) not null default 'pending' check (status in ('pending','delivered','failed')),
  attempts integer not null default 0,
  last_error text,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists notification_deliveries_status_idx on public.notification_deliveries(organization_id, status, created_at);
