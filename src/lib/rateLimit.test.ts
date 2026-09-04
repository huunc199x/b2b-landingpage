import { describe, it, expect } from 'vitest';
import { SlidingWindowRateLimiter } from './rateLimit';

describe('SlidingWindowRateLimiter (rolling 60ph / 5 per IP — NFR-09)', () => {
  it('cho 5 lần đầu, chặn lần thứ 6 trong cửa sổ', () => {
    const rl = new SlidingWindowRateLimiter({ windowMs: 60 * 60 * 1000, max: 5 });
    const ip = '10.0.0.1';
    // 10:00, 10:05, 10:10, 10:15, 10:20 (phút → ms)
    for (const min of [0, 5, 10, 15, 20]) {
      expect(rl.check(ip, min * 60_000).allowed).toBe(true);
    }
    // 10:50 = lần thứ 6 trong [09:50–10:50] → chặn
    expect(rl.check(ip, 50 * 60_000).allowed).toBe(false);
  });

  it('lần cũ rơi khỏi cửa sổ → cho lại', () => {
    const rl = new SlidingWindowRateLimiter({ windowMs: 60 * 60 * 1000, max: 5 });
    const ip = '10.0.0.2';
    for (const min of [0, 5, 10, 15, 20]) rl.check(ip, min * 60_000);
    // 11:01 — mốc 10:00 đã rời cửa sổ [10:01–11:01] → còn 4, cho qua
    expect(rl.check(ip, 61 * 60_000).allowed).toBe(true);
  });

  it('đếm theo từng IP, không gộp', () => {
    const rl = new SlidingWindowRateLimiter({ max: 5 });
    for (let i = 0; i < 5; i++) rl.check('1.1.1.1', i);
    expect(rl.check('1.1.1.1', 6).allowed).toBe(false);
    // IP khác vẫn được
    expect(rl.check('2.2.2.2', 6).allowed).toBe(true);
  });

  it('lần bị chặn không tự kéo dài cửa sổ (không push timestamp)', () => {
    const rl = new SlidingWindowRateLimiter({ windowMs: 1000, max: 2 });
    rl.check('x', 0);
    rl.check('x', 100);
    expect(rl.check('x', 200).allowed).toBe(false); // đã đạt 2
    // sau khi cửa sổ trôi qua 2 lần đầu
    expect(rl.check('x', 1200).allowed).toBe(true);
  });
});
