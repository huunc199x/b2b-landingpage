import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks (không đụng DB/next cache thật) ---
const revalidateTag = vi.fn();
vi.mock('next/cache', () => ({
  revalidateTag: (tag: string) => revalidateTag(tag),
  unstable_cache: (fn: unknown) => fn,
}));

const findFirst = vi.fn();
const update = vi.fn();
vi.mock('@/lib/db', () => ({
  prisma: {
    contentBlock: {
      findFirst: (...a: unknown[]) => findFirst(...a),
      update: (...a: unknown[]) => update(...a),
    },
  },
}));

vi.mock('@/lib/audit', () => ({ writeAudit: vi.fn(async () => {}) }));

import { setVisibility } from './service';
import { AppError } from '@/lib/errors';

beforeEach(() => {
  revalidateTag.mockClear();
  findFirst.mockReset();
  update.mockReset();
});

describe('setVisibility — revalidate + CB-010 (FR-15)', () => {
  it('bật hiển thị khi đủ EN → cập nhật visible + revalidateTag("content-blocks")', async () => {
    findFirst.mockResolvedValue({
      id: 'b1',
      blockType: 'stat',
      payload: { value: '1.200+' },
      i18n: [{ title: 'Customers', description: 'kh' }],
    });
    update.mockResolvedValue({});

    const res = await setVisibility('b1', 'show', 'admin1');
    expect(res.status).toBe('visible');
    expect(update).toHaveBeenCalledOnce();
    expect(revalidateTag).toHaveBeenCalledWith('content-blocks');
  });

  it('bật hiển thị khi thiếu EN → ném CB-010, KHÔNG update/revalidate', async () => {
    findFirst.mockResolvedValue({
      id: 'b2',
      blockType: 'stat',
      payload: {}, // thiếu value
      i18n: [{ title: 'Customers', description: null }],
    });

    await expect(setVisibility('b2', 'show', 'admin1')).rejects.toMatchObject({
      code: 'CB-010',
    });
    expect(update).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('khối không tồn tại → CB-404', async () => {
    findFirst.mockResolvedValue(null);
    await expect(setVisibility('x', 'hide', 'admin1')).rejects.toBeInstanceOf(AppError);
  });
});
