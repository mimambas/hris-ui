create or replace function public.leave_approve_atomic(
  p_organization_id uuid,
  p_leave_id uuid,
  p_approver_id uuid
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_leave public.leave_requests; v_updated integer;
begin
  select * into v_leave from public.leave_requests where id = p_leave_id and organization_id = p_organization_id for update;
  if not found then raise exception 'Leave request not found'; end if;
  if v_leave.status = 'approved' then return jsonb_build_object('id', v_leave.id, 'status', 'approved', 'already_approved', true); end if;
  if v_leave.status <> 'pending' then raise exception 'Leave request is not pending'; end if;
  update public.leave_requests set status = 'approved', approved_by = p_approver_id, approved_at = now(), rejection_reason = null where id = p_leave_id and organization_id = p_organization_id;
  update public.leave_balances set used_days = used_days + v_leave.total_days where employee_id = v_leave.employee_id and organization_id = p_organization_id and leave_type = v_leave.leave_type and year = extract(year from v_leave.start_date)::integer;
  get diagnostics v_updated = row_count;
  if v_updated = 0 then raise exception 'Leave balance not configured for this employee and year'; end if;
  return jsonb_build_object('id', v_leave.id, 'status', 'approved');
end; $$;
revoke execute on function public.leave_approve_atomic(uuid, uuid, uuid) from public, anon, authenticated;
