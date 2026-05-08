-- Allow every authenticated user to record their own app login event.
-- Admins can already read audit_log through the existing admin_read_audit_log policy.

drop policy if exists "users_insert_own_login_audit" on public.audit_log;

create policy "users_insert_own_login_audit"
on public.audit_log for insert
to authenticated
with check (
  actor_user_id = auth.uid()
  and action_type in ('login_success', 'logout')
  and entity_type = 'auth_session'
);

create index if not exists idx_audit_log_login_events
on public.audit_log(action_type, actor_user_id, created_at desc)
where action_type in ('login_success', 'logout');

create or replace function public.record_login_audit(event_metadata jsonb default '{}'::jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  audit_id uuid;
  actor_role text;
begin
  select role::text
    into actor_role
  from public.profiles
  where user_id = auth.uid();

  insert into public.audit_log (
    actor_user_id,
    action_type,
    entity_type,
    description,
    metadata
  )
  values (
    auth.uid(),
    'login_success',
    'auth_session',
    'Successful ' || coalesce(actor_role, 'user') || ' login',
    coalesce(event_metadata, '{}'::jsonb) || jsonb_build_object(
      'role', coalesce(actor_role, event_metadata->>'role', 'Unknown'),
      'recorded_by', 'record_login_audit_rpc'
    )
  )
  returning id into audit_id;

  return audit_id;
end;
$$;

grant execute on function public.record_login_audit(jsonb) to authenticated;

notify pgrst, 'reload schema';
