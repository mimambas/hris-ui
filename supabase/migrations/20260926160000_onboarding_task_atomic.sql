create or replace function public.onboarding_task_toggle_atomic(
  p_organization_id uuid,
  p_onboarding_id uuid,
  p_task_key varchar,
  p_done boolean
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_record public.onboarding_records; v_pending integer; v_status varchar;
begin
  if p_organization_id is null then raise exception 'Organization is required'; end if;
  select * into v_record from public.onboarding_records where id = p_onboarding_id and organization_id = p_organization_id for update;
  if not found then raise exception 'Onboarding record not found'; end if;
  if v_record.status = 'Completed' then raise exception 'Completed onboarding cannot be changed'; end if;
  update public.onboarding_tasks set done = p_done, completed_at = case when p_done then now() else null end, updated_at = now()
  where organization_id = p_organization_id and onboarding_id = p_onboarding_id and task_key = p_task_key;
  if not found then raise exception 'Onboarding task not found'; end if;
  select count(*) into v_pending from public.onboarding_tasks where organization_id = p_organization_id and onboarding_id = p_onboarding_id and done = false;
  v_status := case when v_pending = 0 then 'Completed' else 'On track' end;
  update public.onboarding_records set status = v_status, updated_at = now() where id = p_onboarding_id and organization_id = p_organization_id;
  return jsonb_build_object('done', p_done, 'status', v_status, 'pending', v_pending);
end; $$;
revoke execute on function public.onboarding_task_toggle_atomic(uuid,uuid,varchar,boolean) from public, anon, authenticated;
