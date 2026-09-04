import { describe, it, expect } from 'vitest';
import { AppError, ERROR_CATALOG } from './errors';

describe('errors catalog (LLD §8)', () => {
  it('map mã lỗi canonical sang đúng HTTP status', () => {
    expect(ERROR_CATALOG['LEAD-021'].http).toBe(429);
    expect(ERROR_CATALOG['AUTH-010'].http).toBe(423);
    expect(ERROR_CATALOG['CB-010'].http).toBe(422);
    expect(ERROR_CATALOG['AUTH-403'].http).toBe(403);
  });

  it('AppError giữ code + http + details', () => {
    const err = new AppError('LEAD-001', [{ field: 'email', message: 'sai định dạng' }]);
    expect(err.code).toBe('LEAD-001');
    expect(err.http).toBe(400);
    expect(err.details?.[0]?.field).toBe('email');
  });
});
