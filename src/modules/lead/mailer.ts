/**
 * LeadMailer (G3/FR-09) — gửi email tóm tắt lead tới hộp thư Sale qua adapter (cloud-agnostic).
 * Email lỗi KHÔNG làm mất lead: cập nhật email_status=failed, tăng attempts, không ném ra route.
 */
import { getEmailAdapter } from '@/lib/email';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import type { CleanLead } from './validation';

function buildBody(lead: CleanLead, leadId: string): { subject: string; text: string } {
  const subject = `[Lead B2B] ${lead.companyName} — ${lead.serviceInterest}`;
  const text = [
    'Có lead mới từ landing page B2B Mytel.',
    '',
    `Mã lead: ${leadId}`,
    `Họ tên: ${lead.contactName}`,
    `Email: ${lead.email}`,
    `Điện thoại: ${lead.phone}`,
    `Doanh nghiệp: ${lead.companyName}`,
    `Dịch vụ quan tâm: ${lead.serviceInterest}`,
    `Lời nhắn: ${lead.message ?? '(không có)'}`,
    '',
    'Vui lòng đăng nhập trang quản trị để xem chi tiết.',
  ].join('\n');
  return { subject, text };
}

/**
 * Gửi email báo Sale + cập nhật trạng thái email của lead. Trả về true nếu gửi ok.
 * KHÔNG ném lỗi — nuốt lỗi và ghi email_status=failed (lead vẫn `Mới`).
 */
export async function notifyLeadToSale(lead: CleanLead, leadId: string): Promise<boolean> {
  const adapter = getEmailAdapter();
  const { subject, text } = buildBody(lead, leadId);
  try {
    const result = await adapter.send({
      to: env.leadNotifyTo,
      from: env.leadNotifyFrom,
      subject,
      text,
    });
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        emailStatus: result.ok ? 'sent' : 'failed',
        emailAttempts: { increment: 1 },
      },
    });
    if (!result.ok) {
      logger.warn('lead.email.failed', { entityId: leadId, transport: adapter.name });
    }
    return result.ok;
  } catch (err) {
    logger.error('lead.email.error', {
      entityId: leadId,
      reason: err instanceof Error ? err.message : 'unknown',
    });
    try {
      await prisma.lead.update({
        where: { id: leadId },
        data: { emailStatus: 'failed', emailAttempts: { increment: 1 } },
      });
    } catch {
      /* không làm gì thêm — lead đã lưu, email retry ở vận hành */
    }
    return false;
  }
}
