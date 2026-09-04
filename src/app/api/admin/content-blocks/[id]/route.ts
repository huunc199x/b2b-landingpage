/**
 * GET    /api/admin/content-blocks/{id} — chi tiết khối (FR-12/13/14). CB-404 nếu không tồn tại.
 * PATCH  /api/admin/content-blocks/{id} — cập nhật khối (CB-001/CB-404).
 * DELETE /api/admin/content-blocks/{id} — soft-delete (FR-12). Auth admin.
 */
import type { NextRequest } from 'next/server';
import { ok, failFrom } from '@/lib/envelope';
import { newCorrelationId, clientIpFromHeaders } from '@/lib/correlation';
import { requireAdmin } from '@/lib/auth/guard';
import { getBlock, updateBlock, softDeleteBlock } from '@/modules/admin-content/service';
import type { BlockInput } from '@/modules/admin-content/validation';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const correlationId = newCorrelationId();
  try {
    await requireAdmin();
    const { id } = await params;
    return ok(await getBlock(id), { correlationId });
  } catch (err) {
    return failFrom(err, correlationId);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const correlationId = newCorrelationId();
  try {
    const { id: adminId } = await requireAdmin();
    const { id } = await params;
    const body = (await req.json()) as BlockInput;
    const ip = clientIpFromHeaders(req.headers);
    return ok(await updateBlock(id, body, adminId, ip), { correlationId });
  } catch (err) {
    return failFrom(err, correlationId);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const correlationId = newCorrelationId();
  try {
    const { id: adminId } = await requireAdmin();
    const { id } = await params;
    const ip = clientIpFromHeaders(req.headers);
    return ok(await softDeleteBlock(id, adminId, ip), { correlationId });
  } catch (err) {
    return failFrom(err, correlationId);
  }
}
