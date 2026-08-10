-- Atomically points the *calling* user's active roadmap at a new one:
-- upserts settings.adopted_roadmap_id and mirrors ai_roadmaps.adopted in a
-- single transaction, so a mid-way client failure/network drop can't leave
-- the two representations disagreeing (the risk with doing this as separate
-- sequential client-side writes, which is what growpath-mobile did before
-- this migration).
--
-- Takes only p_roadmap_id and derives the user from auth.uid() rather than
-- trusting a p_user_id argument - this function is security invoker, so
-- without that, any authenticated caller could pass an arbitrary p_user_id
-- and flip another user's adopted roadmap pointer regardless of what RLS
-- policies exist on settings/ai_roadmaps.
drop function if exists set_adopted_roadmap(uuid, uuid);

create or replace function set_adopted_roadmap(p_roadmap_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'set_adopted_roadmap requires an authenticated user';
  end if;

  if not exists (
    select 1 from ai_roadmaps where id = p_roadmap_id and user_id = v_user_id
  ) then
    raise exception 'Roadmap % does not belong to the current user', p_roadmap_id;
  end if;

  -- settings has no unique/exclusion constraint defined in this repo's
  -- migrations (it's an existing joon-dashboard table - see
  -- supabase/README.md), but a (user_id, key) constraint was confirmed to
  -- exist by probing it live: two upserts with the same (user_id, key) and
  -- different values resolved to a single row, not a duplicate.
  insert into settings (key, value, user_id)
  values ('adopted_roadmap_id', p_roadmap_id::text, v_user_id)
  on conflict (user_id, key)
  do update set value = excluded.value;

  update ai_roadmaps
  set adopted = (id = p_roadmap_id)
  where user_id = v_user_id
    and (adopted = true or id = p_roadmap_id);
end;
$$;

revoke all on function set_adopted_roadmap(uuid) from public;
grant execute on function set_adopted_roadmap(uuid) to authenticated;
