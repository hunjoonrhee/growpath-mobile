/** Flattens a `tags` array column across rows, tolerating a null cell - shared by every gap-analysis evidence-source fetcher. */
export function flattenTagsColumn(rows: { tags: string[] | null }[]): string[] {
  return rows.flatMap((row) => row.tags ?? []);
}
