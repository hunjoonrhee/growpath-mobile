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
--
-- 읽기도 owner-only로 잠근 건 의도적: 현재 화면 설계(9개 화면)에 다른 유저의
-- 아바타를 보여주는 곳이 없음(1인 다이어리형 앱). 나중에 팀/소셜 기능이 생겨
-- 남의 아바타를 보여줘야 하면 그때 read 정책만 `bucket_id = 'avatars'`로 완화.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', false,
  5242880, -- 5MB
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 업로드 경로 컨벤션: avatars/{user_id}/{filename}
-- storage.foldername(name)[1] 이 경로의 첫 세그먼트(user_id)를 반환한다.

drop policy if exists "avatars: owner can read" on storage.objects;
create policy "avatars: owner can read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "avatars: owner can upload" on storage.objects;
create policy "avatars: owner can upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "avatars: owner can update" on storage.objects;
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

drop policy if exists "avatars: owner can delete" on storage.objects;
create policy "avatars: owner can delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);
