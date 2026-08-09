-- Phase 0-4: avatars Storage bucket + RLS
--
-- 참고: joon-dashboard 스키마를 확인해보니 프로필 필드(display_name, avatar_url)는
-- 별도 컬럼/테이블이 아니라 기존 `settings` 테이블(EAV: id, key, value, user_id,
-- created_at)에 새 key로 upsert하는 방식이라 스키마 마이그레이션이 필요 없다.
--   upsert into settings (key, value, user_id) values ('display_name', ..., auth.uid())
--     on conflict (key, user_id) do update set value = excluded.value;
--   upsert into settings (key, value, user_id) values ('avatar_url', ..., auth.uid())
--     on conflict (key, user_id) do update set value = excluded.value;
-- 이 마이그레이션은 avatars 파일 저장용 Storage 버킷만 새로 만든다.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

-- 업로드 경로 컨벤션: avatars/{user_id}/{filename}
-- storage.foldername(name)[1] 이 경로의 첫 세그먼트(user_id)를 반환한다.

create policy "avatars: owner can read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "avatars: owner can upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "avatars: owner can update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "avatars: owner can delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);
