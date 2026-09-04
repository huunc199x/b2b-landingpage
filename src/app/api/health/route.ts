import { prisma } from '@/lib/db';
import { ok, fail } from '@/lib/envelope';
import { newCorrelationId } from '@/lib/correlation';
import { logger } from '@/lib/logger';

// Healthcheck phải chạy động (kiểm DB mỗi lần), không cache.
export const dynamic = 'force-dynamic';

/**
 * GET /api/health — liveness + readiness (kiểm DB).
 * DB OK → 200 { status:'ok', db:'up' }. DB lỗi → 500 SYS-500.
 */
export async function GET() {
  const correlationId = newCorrelationId();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return ok(
      { status: 'ok', db: 'up', ts: new Date().toISOString() },
      { correlationId },
    );
  } catch (err) {
    logger.error('health.db.down', {
      correlationId,
      reason: err instanceof Error ? err.message : 'unknown',
    });
    return fail('SYS-500', { correlationId, message: 'DB không sẵn sàng' });
  }
}
