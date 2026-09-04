/**
 * PATCH /api/admin/content-blocks/reorder — sắp thứ tự (FR-15). Auth admin. revalidateTag ở service.
 * Segment tĩnh 'reorder' ưu tiên hơn '[id]' trong App Router.
 */
import type { NextRequest } from 'next/server';
import { ok, fail, failFrom } from '@/lib/envelope';
import { newCorrelationId, clientIpFromHeaders } from '@/lib/correlation';
import { requireAdmin } from '@/lib/auth/guard';
import { reorderBlocks } from '@/modules/admin-content/service';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  const correlationId = newCorrelationId();
  try {
    const { id: adminId } = await requireAdmin();
    const body = (await req.json()) as { items?: { id: string; sortOrder: number }[] };
    if (!Array.isArray(body.items)) {
      return fail('CB-001', {
        correlationId,
        details: [{ field: 'items', message: 'items phải là mảng { id, sortOrder }' }],
      });
    }
    const ip = clientIpFromHeaders(req.headers);
    return ok(await reorderBlocks(body.items, adminId, ip), { correlationId });
  } catch (err) {
    return failFrom(err, correlationId);
  }
}
