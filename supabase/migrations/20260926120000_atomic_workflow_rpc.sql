-- Atomic workflow helpers.
-- The Next.js API routes call these with the service-role key only after
-- requireUser()/requireAdmin() has verified identity, membership, and tenant.
-- The functions themselves re-validate the organization linkage so a mis-wired
-- caller cannot cross tenants.

create or replace function public.payroll_process_atomic(
  p_organization_id uuid,
  p_period_id uuid,
  p_entries jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_period public.payroll_periods;
  v_count integer;
begin
  if p_organization_id is null or p_period_id is null or p_entries is null then
    raise exception 'organization, period, and entries are required';
  end if;

  select * into v_period
  from public.payroll_periods
  where id = p_period_id and organization_id = p_organization_id
  for update;

  if not found then
    raise exception 'Payroll period not found in organization';
  end if;

  if v_period.status = 'locked' then
    raise exception 'Payroll period is locked';
  end if;

  delete from public.payroll_entries
  where organization_id = p_organization_id and period_id = p_period_id;

  if jsonb_array_length(p_entries) > 0 then
    insert into public.payroll_entries (
      organization_id, period_id, employee_id, basic_salary, allowance, overtime,
      gross_salary, pph21, bpjs_kes, bpjs_tk, other_deduction, net_salary, status, error_message
    )
    select
      p_organization_id,
      p_period_id,
      (entry->>'employee_id')::uuid,
      (entry->>'basic_salary')::numeric,
      (entry->>'allowance')::numeric,
      (entry->>'overtime')::numeric,
      (entry->>'gross_salary')::numeric,
      (entry->>'pph21')::numeric,
      (entry->>'bpjs_kes')::numeric,
      (entry->>'bpjs_tk')::numeric,
      (entry->>'other_deduction')::numeric,
      (entry->>'net_salary')::numeric,
      coalesce(entry->>'status', 'processed'),
      entry->>'error_message'
    from jsonb_array_elements(p_entries) as elements(entry)
    where exists (
      select 1 from public.employees e
      where e.id = (entry->>'employee_id')::uuid
        and e.organization_id = p_organization_id
    );
  end if;

  get diagnostics v_count = row_count;

  update public.payroll_periods
  set status = 'processed', processed_at = now(), updated_at = now()
  where id = p_period_id and organization_id = p_organization_id;

  return jsonb_build_object('count', v_count, 'status', 'processed');
end;
$$;

create or replace function public.offboarding_complete_atomic(
  p_organization_id uuid,
  p_offboarding_id uuid
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_record public.offboarding_records;
  v_pending integer;
begin
  if p_organization_id is null or p_offboarding_id is null then
    raise exception 'organization and offboarding record are required';
  end if;

  select * into v_record
  from public.offboarding_records
  where id = p_offboarding_id and organization_id = p_organization_id
  for update;

  if not found then
    raise exception 'Offboarding record not found';
  end if;

  if v_record.status = 'completed' then
    return jsonb_build_object('id', v_record.id, 'status', 'completed', 'already_completed', true);
  end if;

  select count(*) into v_pending
  from public.offboarding_tasks
  where offboarding_id = p_offboarding_id
    and organization_id = p_organization_id
    and done = false;

  if v_pending > 0 then
    raise exception 'Complete all clearance tasks before completing offboarding';
  end if;

  update public.offboarding_records
  set status = 'completed', completed_at = now(), updated_at = now()
  where id = p_offboarding_id and organization_id = p_organization_id;

  update public.employees
  set status = 'inactive', updated_at = now()
  where id = v_record.employee_id and organization_id = p_organization_id;

  return jsonb_build_object('id', v_record.id, 'status', 'completed');
end;
$$;

-- Deny direct-client execution: these functions are called by verified server routes.
revoke execute on function public.payroll_process_atomic(uuid, uuid, jsonb) from public, anon, authenticated;
revoke execute on function public.offboarding_complete_atomic(uuid, uuid) from public, anon, authenticated;
