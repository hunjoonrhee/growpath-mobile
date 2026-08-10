-- Atomically points a user's active roadmap at a new one: upserts
-- settings.adopted_roadmap_id and mirrors ai_roadmaps.adopted in a single
-- transaction, so a mid-way client failure/network drop can't leave the two
-- representations disagreeing (the risk with doing this as separate
-- sequential client-side writes, which is what growpath-mobile did before
-- this migration).
create or replace function set_adopted_roadmap(p_user_id uuid, p_roadmap_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into settings (key, value, user_id)
  values ('adopted_roadmap_id', p_roadmap_id::text, p_user_id)
  on conflict (user_id, key)
  do update set value = excluded.value;

  update ai_roadmaps
  set adopted = (id = p_roadmap_id)
  where user_id = p_user_id
    and (adopted = true or id = p_roadmap_id);
end;
$$;

revoke all on function set_adopted_roadmap(uuid, uuid) from public;
grant execute on function set_adopted_roadmap(uuid, uuid) to authenticated;
