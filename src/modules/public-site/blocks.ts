/**
 * G1 Public site — đọc khối động `visible` theo locale (FR-01/02, BR-DYN-01).
 * Dùng unstable_cache + tag 'content-blocks' để admin revalidate on-demand (public cập nhật ≤10').
 * AN TOÀN BUILD: bọc truy vấn DB trong try/catch → [] khi DB không sẵn sàng (FR-02 hậu-đk thất bại,
 * FSD SCR-01 1b: bỏ qua khối lỗi, phần còn lại vẫn render). Nhờ đó `next build` xanh khi chưa có Postgres.
 */
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import type { AppLocale } from '@/i18n/routing';

export const CONTENT_BLOCKS_TAG = 'content-blocks';

export type PublicBlockType = 'highlight' | 'partner' | 'stat';

export interface PublicBlockView {
  id: string;
  blockType: PublicBlockType;
  sortOrder: number;
  title: string;
  description: string | null;
  payload: Record<string, unknown>;
}

/** Trường bắt buộc của locale theo loại (BR-DYN-01). Thiếu → ẩn ở locale đó. */
function passesLocaleRequirement(
  blockType: PublicBlockType,
  title: string | null | undefined,
  description: string | null | undefined,
  payload: Record<string, unknown>,
): boolean {
  const hasTitle = typeof title === 'string' && title.trim() !== '';
  switch (blockType) {
    case 'highlight':
      return hasTitle && typeof description === 'string' && description.trim() !== '';
    case 'partner':
      return hasTitle; // logo ở payload; tên là title
    case 'stat':
      return hasTitle && typeof payload.value === 'string' && (payload.value as string).trim() !== '';
    default:
      return false;
  }
}

async function queryVisibleBlocks(
  locale: AppLocale,
  type?: PublicBlockType,
): Promise<PublicBlockView[]> {
  try {
    const rows = await prisma.contentBlock.findMany({
      where: {
        status: 'visible',
        deletedAt: null,
        ...(type ? { blockType: type } : {}),
      },
      include: { i18n: { where: { locale } } },
      // DISC-04: trùng sortOrder → tie-break updatedAt desc cho thứ tự ổn định (SRS FR-02/FR-15),
      // đồng bộ với admin-content listBlocks.
      orderBy: [{ blockType: 'asc' }, { sortOrder: 'asc' }, { updatedAt: 'desc' }],
    });

    const views: PublicBlockView[] = [];
    for (const b of rows) {
      const tr = b.i18n[0];
      const payload = (b.payload ?? {}) as Record<string, unknown>;
      if (!passesLocaleRequirement(b.blockType as PublicBlockType, tr?.title, tr?.description, payload)) {
        continue; // ẩn ở locale thiếu trường bắt buộc (BR-DYN-01)
      }
      views.push({
        id: b.id,
        blockType: b.blockType as PublicBlockType,
        sortOrder: b.sortOrder,
        title: tr!.title as string,
        description: tr?.description ?? null,
        payload,
      });
    }
    return views;
  } catch (err) {
    logger.error('public.blocks.read.failed', {
      reason: err instanceof Error ? err.message : 'unknown',
    });
    return []; // FSD SCR-01 1b: bỏ qua khối lỗi, không chặn cả trang
  }
}

/** Đọc khối động visible (đã cache theo tag; revalidate 600s hoặc on-demand từ admin). */
export function getVisibleBlocks(
  locale: AppLocale,
  type?: PublicBlockType,
): Promise<PublicBlockView[]> {
  const cached = unstable_cache(
    () => queryVisibleBlocks(locale, type),
    ['public-content-blocks', locale, type ?? 'all'],
    { tags: [CONTENT_BLOCKS_TAG], revalidate: 600 },
  );
  return cached();
}
