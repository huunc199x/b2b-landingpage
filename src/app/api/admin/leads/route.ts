/**
 * GET /api/admin/leads — danh sách lead (FR-11). Auth admin. Sắp createdAt giảm dần, phân trang 20.
 */
import type { NextRequest } from 'next/server';
import { ok, failFrom } from '@/lib/envelope';
import { newCorrelationId } from '@/lib/correlation';
import { requireAdmin } from '@/lib/auth/guard';
import { listLeads } from '@/modules/lead/adminLeads';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const correlationId = newCorrelationId();
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const result = await listLeads({
      status: status === 'new' || status === 'viewed' ? status : undefined,
      serviceInterest: url.searchParams.get('serviceInterest') ?? undefined,
      dateFrom: url.searchParams.get('dateFrom') ?? undefined,
      dateTo: url.searchParams.get('dateTo') ?? undefined,
      page: Number(url.searchParams.get('page') ?? '1') || 1,
      pageSize: Number(url.searchParams.get('pageSize') ?? '20') || 20,
    });
    return ok(result, { correlationId });
  } catch (err) {
    return failFrom(err, correlationId);
  }
}
