# Supabase migrations

이 프로젝트는 `joon-dashboard`와 **동일한 Supabase 프로젝트**를 그대로 재사용한다
(스키마 변경 최소화 원칙). 여기 있는 SQL은 그 기존 프로젝트에 적용하는 추가
마이그레이션이다.

## 적용 방법

Supabase CLI가 아직 이 머신에 없다면(`brew install supabase/tap/supabase`),
Dashboard → SQL Editor에 각 파일 내용을 순서대로 붙여넣어 실행해도 된다.

CLI를 쓸 경우:
```
supabase link --project-ref <project-ref>
supabase db push
```

## 기존 스키마 요약 (joon-dashboard 기준으로 확인함)

테이블: `ai_roadmaps`, `certifications`, `goals`, `notes`, `project_skills`,
`project_tasks`, `projects`, `sessions`, `settings`, `study_items`,
`today_items`, `topics`.

- `settings`는 `{ id, key, value, user_id, created_at }` 형태의 EAV(키-값) 테이블.
  `name`, `big_goal`, `onboarding_completed`, `adopted_roadmap_id`,
  `career_level` 등이 전부 이 테이블의 key로 저장됨. 새 프로필 필드도 컬럼
  추가가 아니라 이 패턴을 따라 key만 늘리면 된다.
- 프로필/목표는 `insertWithUser`/`upsertWithUser`(`src/lib/supabase.ts`) 헬퍼로
  `user_id`를 자동으로 붙여서 insert/upsert 함.
