import type { Roadmap } from '@/lib/roadmap';

// Ported 1:1 from joon-dashboard's src/lib/gapAnalysis.ts (a pure scoring
// function, not an AI call) so both apps score a roadmap's skill coverage
// identically - same weights, same 30% match threshold.
export type TrustSource = 'cert' | 'practical' | 'study' | 'none';

export type SkillWithSource = {
  name: string;
  tags: string[];
  source: TrustSource;
  matchedTags: string[];
};

export type GapAnalysisInput = {
  roadmap: Roadmap;
  studiedTags: Set<string>;
  certTags: Set<string>;
  practicalTags: Set<string>;
};

export type GapAnalysisResult = {
  gapPct: number;
  totalWeight: number;
  maxWeight: number;
  skills: SkillWithSource[];
};

export function getSkillSource(
  tags: string[] | null | undefined,
  studiedTags: Set<string>,
  certTags: Set<string>,
  practicalTags: Set<string>
): { source: TrustSource; matchedTags: string[] } {
  // tags is typed as always present, but roadmap rows come from an
  // AI-generated response cast without runtime validation - a malformed one
  // shouldn't crash the whole Today screen.
  if (!tags || tags.length === 0) return { source: 'none', matchedTags: [] };

  const certMatched = tags.filter((tag) => certTags.has(tag));
  if (certMatched.length / tags.length >= 0.3) return { source: 'cert', matchedTags: certMatched };

  const practicalMatched = tags.filter((tag) => practicalTags.has(tag));
  if (practicalMatched.length / tags.length >= 0.3) return { source: 'practical', matchedTags: practicalMatched };

  const studyMatched = tags.filter((tag) => studiedTags.has(tag));
  if (studyMatched.length / tags.length >= 0.3) return { source: 'study', matchedTags: studyMatched };

  return { source: 'none', matchedTags: [] };
}

export function getSourceWeight(source: TrustSource): number {
  if (source === 'cert') return 1.0;
  if (source === 'practical') return 1.0;
  if (source === 'study') return 0.6;
  return 0;
}

export function calcGapAnalysis({ roadmap, studiedTags, certTags, practicalTags }: GapAnalysisInput): GapAnalysisResult {
  const skills = roadmap.stages.flatMap((stage) =>
    stage.skills.map((sk): SkillWithSource => {
      const { source, matchedTags } = getSkillSource(sk.tags, studiedTags, certTags, practicalTags);
      return { name: sk.name, tags: sk.tags, source, matchedTags };
    })
  );

  const totalWeight = skills.reduce((sum, sk) => sum + getSourceWeight(sk.source), 0);
  const maxWeight = skills.length;
  const gapPct = maxWeight === 0 ? 0 : Math.round((totalWeight / maxWeight) * 100);

  return { gapPct, totalWeight, maxWeight, skills };
}
