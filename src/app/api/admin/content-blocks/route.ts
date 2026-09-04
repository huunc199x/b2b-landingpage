/**
 * GET /api/admin/content-blocks — danh sách khối (FR-12/13/14/15 list).
 * POST /api/admin/content-blocks — tạo khối (draft) đa ngữ (FR-12/13/14).
 * Auth admin (middleware + requireAdmin). Envelope HLD §7.
 */
import type { NextRequest } from 'next/server';
import { ok, failFrom } from '@/lib/envelope';
import { newCorrelationId, clientIpFromHeaders } from '@/lib/correlation';
import { requireAdmin } from '@/lib/auth/guard';
import { listBlocks, createBlock } from '@/modules/admin-content/service';
import type { BlockInput, BlockType } from '@/modules/admin-content/validation';

export const dynamic = 'force-dynamic';

const BLOCK_TYPES: BlockType[] = ['highlight', 'partner', 'stat'];
const STATUSES = ['draft', 'visible', 'hidden'] as const;

export async function GET(req: NextRequest) {
  const correlationId = newCorrelationId();
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const typeParam = url.searchParams.get('type');
    const statusParam = url.searchParams.get('status');
    const result = await listBlocks({
      type: BLOCK_TYPES.includes(typeParam as BlockType) ? (typeParam as BlockType) : undefined,
      status: STATUSES.includes(statusParam as (typeof STATUSES)[number])
        ? (statusParam as (typeof STATUSES)[number])
        : undefined,
      page: Number(url.searchParams.get('page') ?? '1') || 1,
      pageSize: Number(url.searchParams.get('pageSize') ?? '20') || 20,
    });
    return ok(result, { correlationId });
  } catch (err) {
    return failFrom(err, correlationId);
  }
}

export async function POST(req: NextRequest) {
  const correlationId = newCorrelationId();
  try {
    const { id: adminId } = await requireAdmin();
    const body = (await req.json()) as BlockInput;
    const ip = clientIpFromHeaders(req.headers);
    const result = await createBlock(body, adminId, ip);
    return ok(result, { status: 201, correlationId });
  } catch (err) {
    return failFrom(err, correlationId);
  }
}
