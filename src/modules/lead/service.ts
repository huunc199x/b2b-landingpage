/**
 * LeadService (G3) — submit(input, ctx): pipeline honeypot → Turnstile → rate-limit → validate
 * → consent → persist tx (lead + lead_consent) → email báo Sale (fallback, không mất lead).
 * Thứ tự ƯU TIÊN MÃ LỖI theo bảng quyết định SRS FR-07 (nguồn sự thật, thắng api-spec §3.1):
 * lỗi trường (LEAD-001) > consent (LEAD-010) > rate-limit (LEAD-021). Turnstile fail → lỗi
 * tường minh LEAD-030 (RETRY, không nuốt lead im lặng — DISC-02). Honeypot vẫn 200 giả (bot).
 */
import { ulid } from 'ulid';
import { prisma } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { leadRateLimiter } from '@/lib/rateLimit';
import { verifyTurnstile } from '@/lib/turnstile';
import { env } from '@/lib/env';
import {
  validateLeadFields,
  isHoneypotTriggered,
  decideLead,
  type RawLeadInput,
} from './validation';
import { notifyLeadToSale } from './mailer';

export interface SubmitContext {
  ip: string;
  userAgent?: string;
  source?: string;
  now?: number;
}

export type SubmitResult =
  | { kind: 'created'; leadId: string; status: 'new' }
  | { kind: 'honeypot' }; // bot: route trả 200 giả, KHÔNG tạo lead

export async function submitLead(raw: RawLeadInput, ctx: SubmitContext): Promise<SubmitResult> {
  // 1) Honeypot — bot → 200 giả, không tạo lead, ghi cờ (FR-10 2c / LEAD-020).
  if (isHoneypotTriggered(raw)) {
    logger.warn('lead.honeypot.blocked', { ip: ctx.ip });
    return { kind: 'honeypot' };
  }

  // 2) Turnstile verify server-side (degrade nếu chưa cấu hình secret / lỗi mạng).
  //    DISC-02: khi verify FAIL (khách thật/challenge hỏng — KHÔNG phải honeypot bot rõ ràng)
  //    → KHÔNG nuốt lead im lặng bằng 200 giả nữa. Trả lỗi tường minh (FSD SCR-04) để form
  //    hiển thị trạng thái lỗi cho người dùng RETRY, bảo vệ lead thật (BG-01 / FR-09 2f).
  const turnstile = await verifyTurnstile(
    typeof raw.turnstileToken === 'string' ? raw.turnstileToken : undefined,
    ctx.ip,
  );
  if (!turnstile.ok) {
    logger.warn('lead.turnstile.blocked', { ip: ctx.ip, mode: turnstile.mode });
    throw new AppError('LEAD-030', undefined, 'Xác thực chống spam thất bại, vui lòng thử lại');
  }

  // 3) Rate-limit rolling 60'/5 per IP (FR-10 2d / NFR-09) — KIỂM (ghi nhận lần dùng khi allowed),
  //    nhưng CHƯA ném lỗi: thứ tự ưu tiên mã lỗi do bảng quyết định SRS FR-07 quyết (DISC-01).
  const rl = leadRateLimiter.check(ctx.ip, ctx.now);
  if (!rl.allowed) {
    logger.warn('lead.ratelimit.blocked', { ip: ctx.ip, used: rl.used });
  }

  // 4) Validate trường + 5) consent + 6) rate-limit theo bảng quyết định FR-07.
  //    Ưu tiên: lỗi trường (LEAD-001) > thiếu consent (LEAD-010) > vượt rate-limit (LEAD-021).
  const v = validateLeadFields(raw);
  const decision = decideLead({
    fieldsValid: v.valid,
    consent: raw.consent === true,
    antiSpamOk: rl.allowed,
  });
  if (decision === 'LEAD-001') throw new AppError('LEAD-001', v.details);
  if (decision === 'LEAD-010') throw new AppError('LEAD-010');
  if (decision === 'LEAD-021') throw new AppError('LEAD-021');
  // decision === 'OK'
  const data = v.data!;

  // 7) Persist nguyên tử: lead + lead_consent (FR-08). Lỗi DB → LEAD-030 (rollback).
  const leadId = ulid();
  try {
    await prisma.$transaction(async (tx) => {
      await tx.lead.create({
        data: {
          id: leadId,
          contactName: data.contactName,
          email: data.email,
          phone: data.phone,
          companyName: data.companyName,
          serviceInterest: data.serviceInterest,
          message: data.message,
          source: ctx.source ?? 'landing',
          status: 'new',
          emailStatus: 'pending',
        },
      });
      await tx.leadConsent.create({
        data: {
          id: ulid(),
          leadId,
          given: data.consent,
          consentTextVersion: data.consentTextVersion || env.consentTextVersion,
          ip: ctx.ip || null,
          userAgent: ctx.userAgent ?? null,
        },
      });
    });
  } catch (err) {
    logger.error('lead.persist.failed', {
      reason: err instanceof Error ? err.message : 'unknown',
    });
    throw new AppError('LEAD-030');
  }

  logger.info('lead.created', { entityId: leadId, service: data.serviceInterest });

  // 7) Email báo Sale (side-effect, fallback — không chặn kết quả cho khách, FR-09/2f).
  await notifyLeadToSale(data, leadId);

  return { kind: 'created', leadId, status: 'new' };
}
