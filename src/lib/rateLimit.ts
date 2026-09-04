/**
 * Rate-limit cửa sổ trượt (sliding window) — rolling 60 phút / 5 submit / IP (FR-10/NFR-09).
 * IP client lấy từ X-Forwarded-For (IP trái nhất — Nginx đặt) ở tầng route.
 *
 * GIỚI HẠN ĐÃ BIẾT: bộ nhớ trong tiến trình (in-memory). Đúng cho 1 instance on-prem Docker.
 * Nếu chạy nhiều instance / serverless (Vercel) → cần store dùng chung (Redis) — ghi handover.
 * Logic cửa sổ trượt tách riêng, có tiêm đồng hồ (now) để unit test được.
 */

export interface RateLimitOptions {
  /** Kích thước cửa sổ (ms). Mặc định 60 phút. */
  windowMs?: number;
  /** Số lần tối đa trong cửa sổ. Mặc định 5. */
  max?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Số lần còn lại trong cửa sổ (sau khi tính lần hiện tại nếu allowed). */
  remaining: number;
  /** Số lần đã dùng trong cửa sổ tại thời điểm kiểm. */
  used: number;
}

const DEFAULT_WINDOW_MS = 60 * 60 * 1000; // 60 phút
const DEFAULT_MAX = 5;

export class SlidingWindowRateLimiter {
  private readonly windowMs: number;
  private readonly max: number;
  private readonly hits = new Map<string, number[]>();

  constructor(opts: RateLimitOptions = {}) {
    this.windowMs = opts.windowMs ?? DEFAULT_WINDOW_MS;
    this.max = opts.max ?? DEFAULT_MAX;
  }

  /**
   * Kiểm & ghi nhận 1 lần dùng cho `key` (thường là IP client).
   * Trả allowed=false khi đã đạt ngưỡng trong cửa sổ [now-windowMs, now].
   * Chỉ ghi nhận (đẩy timestamp) khi allowed=true — để lần bị chặn không tự kéo dài cửa sổ.
   */
  check(key: string, now: number = Date.now()): RateLimitResult {
    const cutoff = now - this.windowMs;
    const prev = this.hits.get(key) ?? [];
    // Loại timestamp đã rơi khỏi cửa sổ trượt.
    const recent = prev.filter((t) => t > cutoff);

    if (recent.length >= this.max) {
      this.hits.set(key, recent);
      return { allowed: false, remaining: 0, used: recent.length };
    }

    recent.push(now);
    this.hits.set(key, recent);
    return { allowed: true, remaining: this.max - recent.length, used: recent.length };
  }

  /** Dọn key rỗng (gọi định kỳ nếu cần — không bắt buộc cho MVP). */
  sweep(now: number = Date.now()): void {
    const cutoff = now - this.windowMs;
    for (const [key, arr] of this.hits) {
      const recent = arr.filter((t) => t > cutoff);
      if (recent.length === 0) this.hits.delete(key);
      else this.hits.set(key, recent);
    }
  }

  /** Chỉ dùng cho test — xóa toàn bộ trạng thái. */
  reset(): void {
    this.hits.clear();
  }
}

// Singleton dùng chung cho route lead (1 instance).
export const leadRateLimiter = new SlidingWindowRateLimiter();
