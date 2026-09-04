/**
 * Ghi audit_log (FR-18) — append-only, KHÔNG ghi PII lead / mật khẩu (chỉ entity_id + metadata).
 * G3 (mở lead) và G4 (CRUD khối) và G5 (auth) đều gọi hàm này.
 */
import { ulid } from 'ulid';
import { prisma } from './db';
import { logger } from './logger';

export type AuditAction =
  | 'auth.login'
  | 'auth.login_failed'
  | 'auth.locked'
  | 'auth.logout'
  | 'block.create'
  | 'block.update'
  | 'block.visibility'
  | 'block.reorder'
  | 'block.delete'
  | 'lead.view';

export interface AuditInput {
  adminId?: string | null;
  action: AuditAction;
  entityType?: 'lead' | 'content_block' | 'admin_account' | null;
  entityId?: string | null;
  result?: 'success' | 'failed';
  ip?: string | null;
  detail?: Record<string, unknown>;
}

/** Ghi 1 dòng audit. Không ném lỗi ra ngoài — audit lỗi không được làm hỏng nghiệp vụ chính. */
export async function writeAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        id: ulid(),
        adminId: input.adminId ?? null,
        action: input.action,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        result: input.result ?? 'success',
        ip: input.ip ?? null,
        detail: (input.detail ?? {}) as object,
      },
    });
  } catch (err) {
    logger.error('audit.write.failed', {
      action: input.action,
      reason: err instanceof Error ? err.message : 'unknown',
    });
  }
}
