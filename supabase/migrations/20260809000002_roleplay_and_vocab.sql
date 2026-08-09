-- Phase 0-5: 롤플레이 세션 + 단어장(스페이스드 리피티션) 테이블
--
-- 주의: ai_roadmaps.id 참조 컬럼 타입(uuid 가정)은 실제 joon-dashboard 프로젝트에서
-- `select column_name, data_type from information_schema.columns
--   where table_name = 'ai_roadmaps' and column_name = 'id';`
-- 로 한 번 확인 후 적용할 것. 다르면 roadmap_id 컬럼 타입을 맞춰 수정.

create table if not exists roleplay_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  roadmap_id uuid references ai_roadmaps(id) on delete set null,
  scenario text not null,
  language text not null,
  transcript jsonb not null default '[]'::jsonb,
  summary text,
  created_at timestamptz not null default now()
);

alter table roleplay_sessions enable row level security;

create policy "roleplay_sessions: owner select"
  on roleplay_sessions for select to authenticated
  using (auth.uid() = user_id);

create policy "roleplay_sessions: owner insert"
  on roleplay_sessions for insert to authenticated
  with check (auth.uid() = user_id);

create policy "roleplay_sessions: owner update"
  on roleplay_sessions for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "roleplay_sessions: owner delete"
  on roleplay_sessions for delete to authenticated
  using (auth.uid() = user_id);

create index if not exists roleplay_sessions_user_id_idx
  on roleplay_sessions(user_id);

-- 단어장: SM-2 스타일 스페이스드 리피티션 필드.
-- 하루 20개 cap은 별도 카운터 테이블 없이 애플리케이션 쿼리에서
--   select * from vocab_words
--   where user_id = :uid and next_review_at <= now()
--   order by next_review_at limit 20
-- 로 처리한다 (오늘 못 본 단어는 next_review_at이 그대로라 자연히 다음 날로 이월).

create table if not exists vocab_words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  roleplay_session_id uuid references roleplay_sessions(id) on delete set null,
  language text not null,
  word text not null,
  meaning text not null,
  example_sentence text,
  interval_days integer not null default 1,
  ease_factor numeric(3,2) not null default 2.5,
  review_count integer not null default 0,
  next_review_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table vocab_words enable row level security;

create policy "vocab_words: owner select"
  on vocab_words for select to authenticated
  using (auth.uid() = user_id);

create policy "vocab_words: owner insert"
  on vocab_words for insert to authenticated
  with check (auth.uid() = user_id);

create policy "vocab_words: owner update"
  on vocab_words for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "vocab_words: owner delete"
  on vocab_words for delete to authenticated
  using (auth.uid() = user_id);

create index if not exists vocab_words_user_next_review_idx
  on vocab_words(user_id, next_review_at);
