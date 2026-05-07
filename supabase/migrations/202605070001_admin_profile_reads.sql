-- Allow admin users to read all profile rows from the client as a
-- production fallback when the admin-users Edge Function is unavailable.
-- A SECURITY DEFINER helper avoids recursive RLS checks on public.profiles.

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid()
      and role in ('Super Admin', 'Admin')
  );
$$;

grant execute on function public.current_user_is_admin() to authenticated;

drop policy if exists "profiles_admin_select" on public.profiles;

create policy "profiles_admin_select"
on public.profiles for select
to authenticated
using (public.current_user_is_admin());
