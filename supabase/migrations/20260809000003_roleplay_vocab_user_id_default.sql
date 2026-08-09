-- 이미 커밋된 마이그레이션(20260809000002)은 수정하지 않는다 - Supabase CLI가
-- 마이그레이션 파일별 체크섬을 추적하기 때문에, 어딘가 이미 적용된 뒤라면
-- 파일 내용이 바뀌는 순간 다음 `supabase db push`가 체크섬 불일치로 막힌다.
-- 그래서 컬럼 default 추가는 별도 마이그레이션으로 분리한다.
--
-- user_id를 default auth.uid()로 채우는 이유: 앱 코드(insertWithUser 등)가
-- user_id를 깜빡 안 채워도 DB 레벨에서 항상 요청자 본인으로 채워지고, RLS가
-- 그 값을 다시 검증한다. 클라이언트 쪽 실수 하나에 안전망이 하나만 있지 않게.

alter table roleplay_sessions
  alter column user_id set default auth.uid();

alter table vocab_words
  alter column user_id set default auth.uid();
