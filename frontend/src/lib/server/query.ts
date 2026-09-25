/**
 * Escapes user search text before it is embedded into a PostgREST `.or()` filter.
 *
 * PostgREST parses commas, parentheses and colons as filter syntax, and `%` / `_`
 * as LIKE wildcards, so a raw search value can alter the filter expression or
 * broaden the match. Escaping keeps the value literal while preserving ilike semantics.
 */
export function escapePostgrestSearch(value: string): string {
  return value.replace(/[\\%_,()]/g, (character) => `\\${character}`);
}

/** Wraps a user search value into a safe `column.ilike` OR expression. */
export function orIlike(search: string, columns: string[]): string {
  const safe = escapePostgrestSearch(search.trim());
  return columns.map((column) => `${column}.ilike.%${safe}%`).join(',');
}
