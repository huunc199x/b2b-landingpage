/**
 * GET /api/public/content-blocks — khối động `visible` theo locale (FR-02). Public, ẩn danh.
 * Hành vi lọc GIỐNG logic SSR (BR-DYN-01) — chỉ trả khối đủ trường bắt buộc của locale.
 */
import type { NextRequest } from 'next/server';
import { ok, failFrom } from '@/lib/envelope';
import { newCorrelationId } from '@/lib/correlation';
import { getVisibleBlocks, type PublicBlockType } from '@/modules/public-site/blocks';
import { routing, type AppLocale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

const TYPES: PublicBlockType[] = ['highlight', 'partner', 'stat'];

export async function GET(req: NextRequest) {
  const correlationId = newCorrelationId();
  try {
    const url = new URL(req.url);
    const localeParam = url.searchParams.get('locale');
    const locale: AppLocale = routing.locales.includes(localeParam as AppLocale)
      ? (localeParam as AppLocale)
      : routing.defaultLocale;
    const typeParam = url.searchParams.get('type');
    const type = TYPES.includes(typeParam as PublicBlockType)
      ? (typeParam as PublicBlockType)
      : undefined;

    const items = await getVisibleBlocks(locale, type);
    return ok({ items }, { correlationId });
  } catch (err) {
    return failFrom(err, correlationId);
  }
}
