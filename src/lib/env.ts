/**
 * Cấu hình 12-factor: đọc biến môi trường một chỗ, fail-fast khi thiếu biến bắt buộc.
 * Không log giá trị secret. Dùng ở tầng server (không import vào client component).
 */

function required(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === '') {
    throw new Error(`[env] Thiếu biến môi trường bắt buộc: ${name} (xem .env.example)`);
  }
  return v;
}

function optional(name: string, fallback = ''): string {
  const v = process.env[name];
  return v && v.trim() !== '' ? v : fallback;
}

export type EmailTransport = 'smtp' | 'noop';
export type StorageDriver = 'local' | 'noop';

export const env = {
  // Chỉ validate lười (khi thực sự cần) để build/lint không phụ thuộc runtime secret.
  get databaseUrl(): string {
    return required('DATABASE_URL');
  },
  get authSecret(): string {
    return required('AUTH_SECRET');
  },
  emailTransport: (optional('EMAIL_TRANSPORT', 'noop') as EmailTransport),
  leadNotifyTo: optional('LEAD_NOTIFY_TO', 'sale@mytel.example'),
  leadNotifyFrom: optional('LEAD_NOTIFY_FROM', 'no-reply@mytel.example'),
  smtp: {
    host: optional('SMTP_HOST'),
    port: Number(optional('SMTP_PORT', '587')),
    secure: optional('SMTP_SECURE', 'false') === 'true',
    user: optional('SMTP_USER'),
    password: optional('SMTP_PASSWORD'),
  },
  storageDriver: (optional('STORAGE_DRIVER', 'noop') as StorageDriver),
  storageLocalDir: optional('STORAGE_LOCAL_DIR', './storage/uploads'),
  turnstile: {
    siteKey: optional('TURNSTILE_SITE_KEY'),
    secretKey: optional('TURNSTILE_SECRET_KEY'),
  },
  consentTextVersion: optional('CONSENT_TEXT_VERSION', 'v1'),
  isProduction: process.env.NODE_ENV === 'production',
} as const;
