-- Adds domain + target_language to ai_roadmaps (a joon-dashboard-owned
-- table, no CREATE TABLE for it in this repo - see supabase/README.md).
--
-- Previously the goal-setup screen collected a domain chip (dev/language/
-- art/other) but never sent it to the server, and there was nowhere to
-- persist it even if it had (known gap, see src/lib/roadmap-generation.ts).
-- Both columns are populated by joon-dashboard's /api/roadmap/generate,
-- which now asks Gemini to classify the goal itself rather than trusting
-- the chip alone - domain is a single value, but a goal can require a
-- language on top of it (e.g. "German-speaking lead architect" is domain
-- 'dev' with target_language 'German'), which target_language captures
-- independently of domain instead of trying to encode a hybrid as a single
-- enum value.
--
-- Both nullable: existing rows predate this and have no classification,
-- and target_language is legitimately absent for most non-language goals.
alter table ai_roadmaps
  add column if not exists domain text,
  add column if not exists target_language text;

comment on column ai_roadmaps.domain is
  'One of dev/language/art/exam/writing/other, classified by /api/roadmap/generate at creation time. Null for roadmaps generated before this column existed.';
comment on column ai_roadmaps.target_language is
  'Language the user needs to develop alongside domain (e.g. "German") - independent of domain, since a goal can need a language on top of any domain. Null when no language component was detected.';
