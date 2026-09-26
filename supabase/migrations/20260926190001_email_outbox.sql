create table if not exists public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  recipient_user_id uuid references public.users(id),
  recipient_email varchar(255) not null,
  subject varchar(255) not null,
  body text not null,
  status varchar(20) not null default 'queued' check (status in ('queued','sent','failed')),
  attempts integer not null default 0,
  last_error text,
  sent_at timestamptz,
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists email_outbox_org_status_idx on public.email_outbox(organization_id,status,created_at);
