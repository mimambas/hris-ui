/**
 * Minimal structured logger for the HRIS API.
 * Every entry is a single JSON object so log aggregators can parse level,
 * message, and structured fields without regex.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

let correlationId = '';
/** Correlates every log emitted while handling a single request. */
export function setCorrelationId(id: string) { correlationId = id; }

function emit(level: LogLevel, message: string, fields?: Record<string, unknown>) {
  const entry = { level, message, correlation_id: correlationId || undefined, time: new Date().toISOString(), ...fields };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (message: string, fields?: Record<string, unknown>) => emit('debug', message, fields),
  info: (message: string, fields?: Record<string, unknown>) => emit('info', message, fields),
  warn: (message: string, fields?: Record<string, unknown>) => emit('warn', message, fields),
  error: (message: string, fields?: Record<string, unknown>) => emit('error', message, fields),
};
