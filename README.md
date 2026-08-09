# Growpath

AI 기반 개인 성장 나침반 앱.

> 내 목표가 뭔지 → 그 목표로 가는 길이 뭔지 → 오늘 뭘 해야 하는지 → 내가 하고 있는 게 맞는 방향인지

## 핵심 루프

목표 설정 → AI 로드맵 생성 → 공부기록 → 갭분석 → 오늘의 추천

## 타겟

커리큘럼 없는 독학러:
- **IT 학습자** — 비전공자, 커리어 전환자, 자격증 준비생
- **언어 학습자** — 실용 목적(이민/이직/유학), 특히 독일 거주 외국인

## Tech Stack

- **프론트엔드**: Next.js 15 (App Router), TypeScript, Tailwind CSS, next-intl (ko/de/en), React Query, Zustand
- **AI**: Gemini 2.5 Flash
- **백엔드**: Supabase (PostgreSQL, Auth, RLS), Next.js API Routes
- **배포**: Vercel

## 비즈니스 모델

무료 티어 + Pro 구독(€9.99/월), B2B는 추후 검토

## 개발 가이드

이 저장소에서 작업할 때 지켜야 할 코딩 규칙과 프로젝트 컨벤션은 [`CLAUDE.md`](./CLAUDE.md) 참고.
