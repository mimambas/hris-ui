create or replace function public.onboarding_create_atomic(
  p_organization_id uuid,
  p_name varchar,
  p_role varchar,
  p_department varchar,
  p_start_date date,
  p_buddy varchar,
  p_tasks jsonb
) returns uuid language plpgsql security definer set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  if p_organization_id is null or p_tasks is null or jsonb_array_length(p_tasks) = 0 then raise exception 'Organization and tasks are required'; end if;
  insert into public.onboarding_records(organization_id,name,role,department,start_date,buddy)
  values(p_organization_id,p_name,p_role,p_department,p_start_date,coalesce(p_buddy,'Not assigned')) returning id into v_id;
  insert into public.onboarding_tasks(organization_id,onboarding_id,task_key,label,owner,due_date)
  select p_organization_id,v_id,task->>'task_key',task->>'label',task->>'owner',(task->>'due_date')::date from jsonb_array_elements(p_tasks) task;
  return v_id;
end; $$;
revoke execute on function public.onboarding_create_atomic(uuid,varchar,varchar,varchar,date,varchar,jsonb) from public, anon, authenticated;
