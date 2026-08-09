-- Phase 0-5: 롤플레이 세션 + 단어장(스페이스드 리피티션) 테이블

create table if not exists roleplay_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- ai_roadmaps는 이 마이그레이션 히스토리 밖(joon-dashboard 프로젝트)에 있어 FK를
  -- 걸지 않는다. 타입/존재 여부를 확인한 뒤 필요하면 별도 마이그레이션으로 FK 추가:
  --   select column_name, data_type from information_schema.columns
  --     where table_name = 'ai_roadmaps' and column_name = 'id';
  roadmap_id uuid,
  scenario text not null,
  language text not null,
  transcript jsonb not null default '[]'::jsonb,
  summary text,
  created_at timestamptz not null default now()
);

alter table roleplay_sessions enable row level security;

drop policy if exists "roleplay_sessions: owner select" on roleplay_sessions;
create policy "roleplay_sessions: owner select"
  on roleplay_sessions for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "roleplay_sessions: owner insert" on roleplay_sessions;
create policy "roleplay_sessions: owner insert"
  on roleplay_sessions for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "roleplay_sessions: owner update" on roleplay_sessions;
create policy "roleplay_sessions: owner update"
  on roleplay_sessions for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "roleplay_sessions: owner delete" on roleplay_sessions;
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
-- (user_id, language, word) unique 제약으로 같은 단어 재저장 시
--   on conflict (user_id, language, word) do update set example_sentence = excluded.example_sentence
-- 형태의 upsert를 쓰면 중복 SRS 카드가 생기지 않는다.

create table if not exists vocab_words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  roleplay_session_id uuid references roleplay_sessions(id) on delete set null,
  language text not null,
  word text not null,
  meaning text not null,
  example_sentence text,
  interval_days integer not null default 1 check (interval_days > 0),
  ease_factor numeric(3,2) not null default 2.5 check (ease_factor >= 1.3),
  review_count integer not null default 0 check (review_count >= 0),
  next_review_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, language, word)
);

alter table vocab_words enable row level security;

drop policy if exists "vocab_words: owner select" on vocab_words;
create policy "vocab_words: owner select"
  on vocab_words for select to authenticated
  using (auth.uid() = user_id);

-- roleplay_session_id가 채워진 경우, 그 세션도 같은 유저 소유여야 통과.
-- (다른 유저의 roleplay_sessions.id를 가리키게 만드는 걸 RLS 레벨에서 차단)
drop policy if exists "vocab_words: owner insert" on vocab_words;
create policy "vocab_words: owner insert"
  on vocab_words for insert to authenticated
  with check (
    auth.uid() = user_id
    and (
      roleplay_session_id is null
      or exists (
        select 1 from roleplay_sessions rs
        where rs.id = roleplay_session_id and rs.user_id = auth.uid()
      )
    )
  );

drop policy if exists "vocab_words: owner update" on vocab_words;
create policy "vocab_words: owner update"
  on vocab_words for update to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      roleplay_session_id is null
      or exists (
        select 1 from roleplay_sessions rs
        where rs.id = roleplay_session_id and rs.user_id = auth.uid()
      )
    )
  );

drop policy if exists "vocab_words: owner delete" on vocab_words;
create policy "vocab_words: owner delete"
  on vocab_words for delete to authenticated
  using (auth.uid() = user_id);

create index if not exists vocab_words_user_next_review_idx
  on vocab_words(user_id, next_review_at);
