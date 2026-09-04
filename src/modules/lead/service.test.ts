import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock I/O deps: Turnstile verify, persistence, mailer — để test THUẦN pipeline submitLead.
vi.mock('@/lib/turnstile', () => ({ verifyTurnstile: vi.fn() }));
vi.mock('@/lib/db', () => ({ prisma: { $transaction: vi.fn().mockResolvedValue(undefined) } }));
vi.mock('@/modules/lead/mailer', () => ({ notifyLeadToSale: vi.fn().mockResolvedValue(undefined) }));

import { submitLead } from './service';
import { verifyTurnstile } from '@/lib/turnstile';
import { prisma } from '@/lib/db';
import { leadRateLimiter } from '@/lib/rateLimit';
import { AppError } from '@/lib/errors';
import type { RawLeadInput } from './validation';

const mockedVerify = vi.mocked(verifyTurnstile);

const validRaw: RawLeadInput = {
  contactName: 'Le Van A',
  email: 'a@cty.com',
  phone: '0912345678',
  companyName: 'Cong ty A',
  serviceInterest: 'dia',
  message: 'Can bao gia',
  consent: true,
  consentTextVersion: 'v1',
  website: '',
};

beforeEach(() => {
  vi.clearAllMocks();
  leadRateLimiter.reset();
  mockedVerify.mockResolvedValue({ ok: true, mode: 'verified' });
});

describe('submitLead — Turnstile fail (DISC-02: KHÔNG nuốt lead im lặng)', () => {
  it('verify FAIL (khách thật) → ném LEAD-030 tường minh, KHÔNG tạo lead (không 200 giả)', async () => {
    mockedVerify.mockResolvedValue({ ok: false, mode: 'failed' });
    await expect(submitLead(validRaw, { ip: '1.2.3.4' })).rejects.toBeInstanceOf(AppError);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('thông điệp mời người dùng RETRY (form hiển thị trạng thái lỗi)', async () => {
    mockedVerify.mockResolvedValue({ ok: false, mode: 'failed' });
    try {
      await submitLead(validRaw, { ip: '1.2.3.4' });
      expect.unreachable('phải ném lỗi, không trả success giả');
    } catch (e) {
      expect(e).toBeInstanceOf(AppError);
      expect((e as AppError).code).toBe('LEAD-030');
      expect((e as Error).message).toContain('thử lại');
    }
  });
});

describe('submitLead — honeypot vẫn 200 giả (bot rõ ràng, giữ nguyên)', () => {
  it('honeypot dính → { kind: honeypot }, KHÔNG gọi Turnstile, KHÔNG tạo lead', async () => {
    const r = await submitLead({ ...validRaw, website: 'http://spam' }, { ip: '1.2.3.4' });
    expect(r).toEqual({ kind: 'honeypot' });
    expect(mockedVerify).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

describe('submitLead — ưu tiên mã lỗi theo SRS FR-07 (DISC-01)', () => {
  it('lỗi trường + vượt rate-limit → ưu tiên LEAD-001 (không phải LEAD-021)', async () => {
    for (let i = 0; i < 5; i++) leadRateLimiter.check('9.9.9.9'); // đẩy IP vượt ngưỡng 5
    try {
      await submitLead({ ...validRaw, email: 'bad' }, { ip: '9.9.9.9' });
      expect.unreachable('phải ném lỗi');
    } catch (e) {
      expect((e as AppError).code).toBe('LEAD-001');
    }
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('input hợp lệ + qua Turnstile + trong rate-limit → tạo lead', async () => {
    const r = await submitLead(validRaw, { ip: '5.5.5.5' });
    expect(r.kind).toBe('created');
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
