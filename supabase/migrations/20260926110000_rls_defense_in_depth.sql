-- Defense-in-depth RLS for the custom-JWT architecture.
-- The application deliberately uses the Supabase service-role key server-side;
-- service_role bypasses RLS. These policies prevent accidental anon/authenticated
-- direct-table access while application predicates remain authoritative.
do $$
declare
  table_name text;
  tenant_tables constant text[] := array[
    'users','departments','positions','employees','attendance_records',
    'leave_requests','leave_balances','audit_logs','payroll_periods',
    'payroll_entries','expense_claims','documents','onboarding_records',
    'onboarding_tasks','notifications','recruitment_vacancies',
    'recruitment_candidates','organization_memberships','organization_settings',
    'report_generations','checklist_templates','document_requests',
    'offboarding_records','offboarding_tasks','roles','role_permissions'
  ];
begin
  foreach table_name in array tenant_tables loop
    execute format('alter table public.%I enable row level security', table_name);
    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = table_name and policyname = 'deny_direct_client_access'
    ) then
      execute format('create policy deny_direct_client_access on public.%I for all to anon, authenticated using (false) with check (false)', table_name);
    end if;
  end loop;
end $$;
