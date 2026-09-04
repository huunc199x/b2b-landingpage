/**
 * Structured logging (JSON) + redact PII (NFR-04).
 * Không log email/phone/nội dung PII thô — chỉ ghi mã (lead.id, correlationId).
 */

type Level = 'debug' | 'info' | 'warn' | 'error';

// Các khoá nhạy cảm bị che khi log (PDPL).
const PII_KEYS = new Set([
  'email',
  'phone',
  'contactname',
  'companyname',
  'message',
  'password',
  'passwordhash',
  'password_hash',
  'ip',
  'useragent',
  'user_agent',
]);

function redact(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(redact);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = PII_KEYS.has(k.toLowerCase()) ? '[redacted]' : redact(v);
  }
  return out;
}

function emit(level: Level, message: string, context?: Record<string, unknown>) {
  const line = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(context ? (redact(context) as Record<string, unknown>) : {}),
  };
  const serialized = JSON.stringify(line);
  if (level === 'error') console.error(serialized);
  else if (level === 'warn') console.warn(serialized);
  else console.log(serialized);
}

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) =>
    process.env.NODE_ENV === 'development' && emit('debug', msg, ctx),
  info: (msg: string, ctx?: Record<string, unknown>) => emit('info', msg, ctx),
  warn: (msg: string, ctx?: Record<string, unknown>) => emit('warn', msg, ctx),
  error: (msg: string, ctx?: Record<string, unknown>) => emit('error', msg, ctx),
};
