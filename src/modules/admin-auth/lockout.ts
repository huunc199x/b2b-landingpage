/**
 * LockoutPolicy (G5/FR-16) — khóa 5 lần sai / 15 phút → AUTH-010. Hàm THUẦN để unit test.
 * Trạng thái nguồn: (failedAttempts, status, lockedUntil). Kết quả: hành động + trạng thái kế.
 * Mô hình: đếm dồn số lần sai cho tới khi đạt ngưỡng → khóa 15'; khóa hết hạn → đếm lại từ 0.
 */
export const MAX_FAILED = 5;
export const LOCK_MS = 15 * 60 * 1000; // 15 phút

export interface AccountLockState {
  failedAttempts: number;
  status: 'active' | 'locked';
  lockedUntil: Date | null;
}

export type LoginOutcome =
  | { action: 'allow'; next: { failedAttempts: number; status: 'active'; lockedUntil: null } }
  | { action: 'reject_locked'; retryAfterMs: number }
  | {
      action: 'reject_bad';
      locked: boolean;
      next: { failedAttempts: number; status: 'active' | 'locked'; lockedUntil: Date | null };
    };

function isLocked(state: AccountLockState, now: number): boolean {
  return (
    state.status === 'locked' &&
    state.lockedUntil !== null &&
    state.lockedUntil.getTime() > now
  );
}

/**
 * @param passwordOk kết quả verify mật khẩu (đã tính ở tầng gọi)
 * @param now epoch ms (tiêm để test)
 */
export function evaluateLogin(
  state: AccountLockState,
  passwordOk: boolean,
  now: number = Date.now(),
): LoginOutcome {
  // Đang trong thời gian khóa → từ chối, báo thời gian còn lại (AUTH-010).
  if (isLocked(state, now)) {
    return { action: 'reject_locked', retryAfterMs: state.lockedUntil!.getTime() - now };
  }

  // Khóa đã hết hạn → coi như đếm lại từ 0.
  const lockExpired = state.status === 'locked' && state.lockedUntil !== null && state.lockedUntil.getTime() <= now;
  const base = lockExpired ? 0 : state.failedAttempts;

  if (passwordOk) {
    return { action: 'allow', next: { failedAttempts: 0, status: 'active', lockedUntil: null } };
  }

  const newAttempts = base + 1;
  if (newAttempts >= MAX_FAILED) {
    return {
      action: 'reject_bad',
      locked: true,
      next: { failedAttempts: newAttempts, status: 'locked', lockedUntil: new Date(now + LOCK_MS) },
    };
  }
  return {
    action: 'reject_bad',
    locked: false,
    next: { failedAttempts: newAttempts, status: 'active', lockedUntil: null },
  };
}
