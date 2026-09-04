/**
 * GET /api/admin/leads/{id} — chi tiết lead + đánh dấu `viewed` (FR-11). Auth admin. CB-404 nếu không có.
 */
import type { NextRequest } from 'next/server';
import { ok, failFrom } from '@/lib/envelope';
import { newCorrelationId, clientIpFromHeaders } from '@/lib/correlation';
import { requireAdmin } from '@/lib/auth/guard';
import { getLeadAndMarkViewed } from '@/modules/lead/adminLeads';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const correlationId = newCorrelationId();
  try {
    const { id: adminId } = await requireAdmin();
    const { id } = await params;
    const ip = clientIpFromHeaders(req.headers);
    return ok(await getLeadAndMarkViewed(id, adminId, ip), { correlationId });
  } catch (err) {
    return failFrom(err, correlationId);
  }
}
