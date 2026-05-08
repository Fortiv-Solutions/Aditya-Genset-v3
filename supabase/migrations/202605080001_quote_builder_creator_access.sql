-- Let sales users read and update quotes they personally create.
-- Quote Builder can create quotes without a linked lead, so creator ownership
-- must be enough for the insert + select save flow to succeed.

drop policy if exists "quotes_select" on public.quotes;
drop policy if exists "quotes_insert" on public.quotes;
drop policy if exists "quotes_update" on public.quotes;
drop policy if exists "quote_items_select" on public.quote_items;
drop policy if exists "quote_items_insert" on public.quote_items;

create policy "quotes_select"
on public.quotes for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('Super Admin','Admin','Sales Manager')
  )
  OR created_by_user_id = auth.uid()
  OR exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'Sales Executive'
      and quotes.lead_id is not null
      and exists (
        select 1
        from public.leads l
        where l.id = quotes.lead_id
          and l.assigned_to_user_id = auth.uid()
      )
  )
);

create policy "quotes_insert"
on public.quotes for insert
to authenticated
with check (
  created_by_user_id = auth.uid()
  OR exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('Super Admin','Admin','Sales Manager','Sales Executive')
  )
);

create policy "quotes_update"
on public.quotes for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('Super Admin','Admin','Sales Manager')
  )
  OR created_by_user_id = auth.uid()
  OR exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'Sales Executive'
      and quotes.lead_id is not null
      and exists (
        select 1
        from public.leads l
        where l.id = quotes.lead_id
          and l.assigned_to_user_id = auth.uid()
      )
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role in ('Super Admin','Admin','Sales Manager')
  )
  OR created_by_user_id = auth.uid()
  OR exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'Sales Executive'
      and quotes.lead_id is not null
      and exists (
        select 1
        from public.leads l
        where l.id = quotes.lead_id
          and l.assigned_to_user_id = auth.uid()
      )
  )
);

create policy "quote_items_select"
on public.quote_items for select
to authenticated
using (
  exists (
    select 1
    from public.quotes q
    where q.id = quote_items.quote_id
      and (
        exists (
          select 1 from public.profiles p
          where p.user_id = auth.uid()
            and p.role in ('Super Admin','Admin','Sales Manager')
        )
        OR q.created_by_user_id = auth.uid()
        OR exists (
          select 1 from public.profiles p
          where p.user_id = auth.uid()
            and p.role = 'Sales Executive'
            and q.lead_id is not null
            and exists (
              select 1
              from public.leads l
              where l.id = q.lead_id
                and l.assigned_to_user_id = auth.uid()
            )
        )
      )
  )
);

create policy "quote_items_insert"
on public.quote_items for insert
to authenticated
with check (
  exists (
    select 1
    from public.quotes q
    where q.id = quote_items.quote_id
      and (
        exists (
          select 1 from public.profiles p
          where p.user_id = auth.uid()
            and p.role in ('Super Admin','Admin','Sales Manager')
        )
        OR q.created_by_user_id = auth.uid()
        OR exists (
          select 1 from public.profiles p
          where p.user_id = auth.uid()
            and p.role = 'Sales Executive'
            and q.lead_id is not null
            and exists (
              select 1
              from public.leads l
              where l.id = q.lead_id
                and l.assigned_to_user_id = auth.uid()
            )
        )
      )
  )
);
