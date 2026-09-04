/**
 * POST /api/leads — Submit lead (FR-07/08/09/10). Public, ẩn danh.
 * Envelope HLD §7. Honeypot → 200 giả (không lộ cơ chế). Lỗi nghiệp vụ → mã LEAD-*.
 */
import type { NextRequest } from 'next/server';
import { ulid } from 'ulid';
import { ok, failFrom, fail } from '@/lib/envelope';
import { newCorrelationId, clientIpFromHeaders } from '@/lib/correlation';
import { submitLead } from '@/modules/lead/service';
import type { RawLeadInput } from '@/modules/lead/validation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const correlationId = newCorrelationId();
  let raw: RawLeadInput;
  try {
    raw = (await req.json()) as RawLeadInput;
  } catch {
    return fail('LEAD-001', {
      correlationId,
      details: [{ field: '_body', message: 'Body JSON không hợp lệ' }],
    });
  }

  const ip = clientIpFromHeaders(req.headers);
  const userAgent = req.headers.get('user-agent') ?? undefined;
  // Nguồn: nếu client gửi `source` hợp lệ (vd 'service:dia') thì dùng, mặc định 'landing'.
  const source =
    typeof (raw as { source?: unknown }).source === 'string'
      ? ((raw as { source?: string }).source as string).slice(0, 80)
      : 'landing';

  try {
    const result = await submitLead(raw, { ip, userAgent, source });
    if (result.kind === 'honeypot') {
      // 200 giả — giống thành công, KHÔNG tạo lead (api-spec §3.1).
      return ok({ leadId: ulid(), status: 'new' }, { correlationId });
    }
    return ok({ leadId: result.leadId, status: result.status }, { correlationId });
  } catch (err) {
    return failFrom(err, correlationId);
  }
}
