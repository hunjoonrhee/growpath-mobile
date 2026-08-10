export type Domain = 'dev' | 'language' | 'art' | 'other';

export const DOMAINS: Domain[] = ['dev', 'language', 'art', 'other'];

export const DOMAIN_LABEL_KEY: Record<Domain, string> = {
  dev: 'today.domain.dev',
  language: 'today.domain.language',
  art: 'today.domain.art',
  other: 'today.domain.other',
};
