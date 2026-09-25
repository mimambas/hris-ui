create table if not exists public.checklist_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name varchar(255) not null,
  category varchar(80) not null,
  assignee varchar(80) not null default 'New hire',
  due_date date not null,
  priority varchar(20) not null default 'Medium' check (priority in ('Low','Medium','High')),
  status varchar(20) not null default 'pending' check (status in ('pending','in-progress','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists checklist_templates_org_idx on public.checklist_templates(organization_id, due_date);
