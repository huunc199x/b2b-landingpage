/**
 * Xác minh Cloudflare Turnstile phía server (HLD ADR-05 / api-spec §3.1).
 * Degrade an toàn: nếu CHƯA cấu hình secret (dev/UAT) → coi như PASS (dựa honeypot + rate-limit).
 * Timeout 3s; lỗi mạng/timeout → degrade PASS (không chặn khách thật) nhưng ghi log.
 */
import { env } from './env';
import { logger } from './logger';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TIMEOUT_MS = 3000;

export interface TurnstileResult {
  /** true = cho đi tiếp (verified hoặc degrade). */
  ok: boolean;
  /** 'verified' | 'degraded' | 'failed' — để ghi log/audit. */
  mode: 'verified' | 'degraded' | 'failed';
}

export async function verifyTurnstile(
  token: string | undefined,
  remoteIp?: string,
): Promise<TurnstileResult> {
  const secret = env.turnstile.secretKey;

  // Chưa bật Turnstile (secret rỗng) → degrade.
  if (!secret) {
    return { ok: true, mode: 'degraded' };
  }

  // Bật Turnstile nhưng thiếu token → coi là fail (client phải gửi token).
  if (!token) {
    return { ok: false, mode: 'failed' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set('remoteip', remoteIp);

    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      body,
      signal: controller.signal,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success
      ? { ok: true, mode: 'verified' }
      : { ok: false, mode: 'failed' };
  } catch (err) {
    // Timeout/lỗi mạng → degrade (không chặn khách thật), ghi log để theo dõi.
    logger.warn('turnstile.verify.degraded', {
      reason: err instanceof Error ? err.message : 'unknown',
    });
    return { ok: true, mode: 'degraded' };
  } finally {
    clearTimeout(timer);
  }
}
