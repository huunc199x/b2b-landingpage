/**
 * CorrelationId — sinh mỗi request để truy vết log (HLD §7). Dạng ULID.
 */
import { ulid } from 'ulid';

export function newCorrelationId(): string {
  return ulid();
}

/** Lấy IP client theo X-Forwarded-For (IP trái nhất — Nginx đặt), fallback rỗng. */
export function clientIpFromHeaders(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    return xff.split(',')[0]!.trim();
  }
  return headers.get('x-real-ip')?.trim() ?? '';
}
