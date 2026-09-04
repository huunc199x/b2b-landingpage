/**
 * LeadService (G3) — submit(input, ctx): pipeline honeypot → rate-limit → Turnstile → validate
 * → consent → persist tx (lead + lead_consent) → email báo Sale (fallback, không mất lead).
 * Thứ tự cổng bám api-spec §3.1 ("Áp honeypot + rate-limit + Turnstile + consent").
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

  // 2) Rate-limit rolling 60'/5 per IP (FR-10 2d / NFR-09).
  const rl = leadRateLimiter.check(ctx.ip, ctx.now);
  if (!rl.allowed) {
    logger.warn('lead.ratelimit.blocked', { ip: ctx.ip, used: rl.used });
    throw new AppError('LEAD-021');
  }

  // 3) Turnstile verify server-side (degrade nếu chưa cấu hình secret / lỗi mạng).
  const turnstile = await verifyTurnstile(
    typeof raw.turnstileToken === 'string' ? raw.turnstileToken : undefined,
    ctx.ip,
  );
  if (!turnstile.ok) {
    // Xác minh bot thất bại → xử lý như honeypot (200 giả, không lộ cơ chế).
    // [ĐIỂM NGHI NGỜ — cần SA làm rõ]: api-spec không định mã lỗi riêng cho Turnstile fail.
    logger.warn('lead.turnstile.blocked', { ip: ctx.ip, mode: turnstile.mode });
    return { kind: 'honeypot' };
  }

  // 4) Validate trường + 5) consent (bảng quyết định FR-07).
  const v = validateLeadFields(raw);
  const decision = decideLead({
    fieldsValid: v.valid,
    consent: raw.consent === true,
    antiSpamOk: true, // honeypot/rate-limit đã lọc ở trên
  });
  if (decision === 'LEAD-001') throw new AppError('LEAD-001', v.details);
  if (decision === 'LEAD-010') throw new AppError('LEAD-010');
  // decision === 'OK'
  const data = v.data!;

  // 6) Persist nguyên tử: lead + lead_consent (FR-08). Lỗi DB → LEAD-030 (rollback).
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
