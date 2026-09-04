/**
 * PATCH /api/admin/content-blocks/{id}/visibility — bật/ẩn khối (FR-15).
 * action=show chặn nếu thiếu trường EN bắt buộc → CB-010. revalidateTag ở service.
 */
import type { NextRequest } from 'next/server';
import { ok, fail, failFrom } from '@/lib/envelope';
import { newCorrelationId, clientIpFromHeaders } from '@/lib/correlation';
import { requireAdmin } from '@/lib/auth/guard';
import { setVisibility } from '@/modules/admin-content/service';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const correlationId = newCorrelationId();
  try {
    const { id: adminId } = await requireAdmin();
    const { id } = await params;
    const body = (await req.json()) as { action?: string };
    if (body.action !== 'show' && body.action !== 'hide') {
      return fail('CB-001', {
        correlationId,
        details: [{ field: 'action', message: 'action phải là "show" hoặc "hide"' }],
      });
    }
    const ip = clientIpFromHeaders(req.headers);
    return ok(await setVisibility(id, body.action, adminId, ip), { correlationId });
  } catch (err) {
    return failFrom(err, correlationId);
  }
}
