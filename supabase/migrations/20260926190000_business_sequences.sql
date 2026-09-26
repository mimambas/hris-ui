create table if not exists public.organization_counters (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  counter_key varchar(80) not null,
  counter_value bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (organization_id, counter_key)
);

create or replace function public.next_business_sequence(p_organization_id uuid, p_counter_key varchar, p_floor bigint default 0)
returns bigint language plpgsql security definer set search_path = public, pg_temp as $$
declare v_value bigint;
begin
  if p_organization_id is null or p_counter_key is null or p_counter_key = '' then raise exception 'Organization and counter key are required'; end if;
  insert into public.organization_counters(organization_id,counter_key,counter_value) values(p_organization_id,p_counter_key,greatest(0,p_floor)) on conflict (organization_id,counter_key) do nothing;
  update public.organization_counters set counter_value = greatest(counter_value + 1, p_floor), updated_at = now() where organization_id = p_organization_id and counter_key = p_counter_key returning counter_value into v_value;
  return v_value;
end; $$;
revoke execute on function public.next_business_sequence(uuid,varchar,bigint) from public, anon, authenticated;
