import { describe, it, expect } from 'vitest';
import { evaluateLogin, MAX_FAILED, LOCK_MS } from './lockout';

const active = { failedAttempts: 0, status: 'active' as const, lockedUntil: null };

describe('LockoutPolicy (FR-16 — khóa 5 sai / 15 phút)', () => {
  it('mật khẩu đúng → allow, reset đếm', () => {
    const r = evaluateLogin({ failedAttempts: 3, status: 'active', lockedUntil: null }, true, 0);
    expect(r.action).toBe('allow');
    if (r.action === 'allow') expect(r.next.failedAttempts).toBe(0);
  });

  it('sai lần 1 → reject_bad, chưa khóa', () => {
    const r = evaluateLogin(active, false, 0);
    expect(r.action).toBe('reject_bad');
    if (r.action === 'reject_bad') {
      expect(r.locked).toBe(false);
      expect(r.next.failedAttempts).toBe(1);
    }
  });

  it('sai lần thứ 5 → khóa, đặt lockedUntil = now + 15ph', () => {
    const r = evaluateLogin({ failedAttempts: MAX_FAILED - 1, status: 'active', lockedUntil: null }, false, 1000);
    expect(r.action).toBe('reject_bad');
    if (r.action === 'reject_bad') {
      expect(r.locked).toBe(true);
      expect(r.next.status).toBe('locked');
      expect(r.next.lockedUntil?.getTime()).toBe(1000 + LOCK_MS);
    }
  });

  it('đang khóa (lockedUntil > now) → reject_locked kể cả mật khẩu đúng', () => {
    const lockedUntil = new Date(10_000);
    const r = evaluateLogin({ failedAttempts: 5, status: 'locked', lockedUntil }, true, 5_000);
    expect(r.action).toBe('reject_locked');
    if (r.action === 'reject_locked') expect(r.retryAfterMs).toBe(5_000);
  });

  it('khóa hết hạn → đếm lại từ 0; mật khẩu đúng → allow', () => {
    const lockedUntil = new Date(1_000);
    const r = evaluateLogin({ failedAttempts: 5, status: 'locked', lockedUntil }, true, 2_000);
    expect(r.action).toBe('allow');
  });

  it('khóa hết hạn + sai lại → đếm từ 1 (không khóa ngay)', () => {
    const lockedUntil = new Date(1_000);
    const r = evaluateLogin({ failedAttempts: 5, status: 'locked', lockedUntil }, false, 2_000);
    expect(r.action).toBe('reject_bad');
    if (r.action === 'reject_bad') {
      expect(r.locked).toBe(false);
      expect(r.next.failedAttempts).toBe(1);
    }
  });
});
