/**
 * CSV row type used by parseCsv
 */
export type CsvRow = Record<string, string>;

/**
 * Parse a single CSV line, respecting quoted fields.
 */
function parseLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let value = '';
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (ch === delimiter && !quoted) {
      values.push(value.trim());
      value = '';
    } else {
      value += ch;
    }
  }
  values.push(value.trim());
  return values;
}

/**
 * Parse CSV text into an array of objects.
 */
export function parseCsv(text: string): CsvRow[] {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const delimiter = parseLine(lines[0], ',').length >= parseLine(lines[0], ';').length ? ',' : ';';
  const headers = parseLine(lines[0], delimiter).map((h) => h.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const values = parseLine(line, delimiter);
    return headers.reduce<CsvRow>((row, header, index) => {
      if (header) row[header] = values[index] ?? '';
      return row;
    }, {});
  });
}

/**
 * Escape a value for CSV output.
 */
function escapeCsvValue(value: unknown): string {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Convert an array of objects to CSV text.
 */
export function toCsv<T extends Record<string, unknown>>(rows: T[], columns: string[]): string {
  const header = columns.map(escapeCsvValue).join(',');
  const body = rows.map((row) => columns.map((column) => escapeCsvValue(row[column])).join(','));
  return [header, ...body].join('\r\n');
}

/**
 * Convert an array of objects to a CSV Blob and trigger a browser download.
 */
export function downloadCsv<T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[],
): void {
  if (rows.length === 0) return;

  const keys = columns ? columns.map((c) => String(c.key)) : (Object.keys(rows[0]) as string[]);
  const headers = columns ? columns.map((c) => c.header) : keys;

  const csv = [
    headers.map(escapeCsvValue).join(','),
    ...rows.map((row) => keys.map((k) => escapeCsvValue(row[k])).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
