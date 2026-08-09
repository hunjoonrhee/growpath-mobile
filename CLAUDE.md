# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project overview

**Growpath** — AI 기반 개인 성장 나침반 앱. 핵심 루프: 목표 → AI 로드맵 생성 →
공부기록 → 갭분석 → 오늘의 추천.

- 비즈니스 모델: 무료 티어 + Pro(€9.99/월), B2B는 나중에 검토
- 타겟: 커리큘럼 없는 독학러 — (1) IT 학습자(커리어 전환, 자격증 준비),
  (2) 언어 학습자(특히 독일 거주 외국인). 목표 유형 두 가지(기한 있는 시험/자격증
  vs 장기 커리어 나침반)에 따라 온보딩·UI가 분기됨
- 타겟 시장 순서: 한국 → 독일 → 일본

## Tech stack

- **웹 프론트엔드**: Next.js 15 (App Router), TypeScript, Tailwind, next-intl
  (ko/de/en), React Query, Zustand, react-markdown + react-syntax-highlighter
- **AI**: Gemini 2.5 Flash — `/api/roadmap/generate`, `/api/coach/suggest`,
  `/api/tutor/chat`. 코드리뷰 모드는 추후 Claude 모델로 교체 검토 중
- **백엔드**: Supabase (Postgres + Auth + RLS) + Next.js API Routes
- **배포**: Vercel. 레포: `hunjoonrhee/joon-dashboard`

## 코딩 규칙 (항상 적용)

- SOLID, 특히 SRP — 컴포넌트/함수 하나에 책임 하나만
- 컴포넌트는 잘게 쪼개서 별도 파일로; 인라인 정의 금지
- TypeScript strict — 암묵적 `any` 금지, props/return 타입 명시
- 기능별 폴더는 `hooks/`, `lib/`, `components/` 구조 사용 (언더스코어 없음) —
  예시는 `tutor/` 폴더 참고
- 유지보수 비용 높은 지름길 금지 — 항상 올바른 방향 제안
- i18n: 텍스트 하드코딩 금지, `ko`/`de`/`en` 세 파일 동시 업데이트

## 환경변수
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, NEXT_PUBLIC_SITE_URL,
RESEND_API_KEY, GOOGLE_TTS_API_KEY, STRIPE_SECRET_KEY,
STRIPE_WEBHOOK_SECRET

## 참고

전체 제품 맥락, BA 분석, 백로그는 `docs/handover-v12.md` 참고.
