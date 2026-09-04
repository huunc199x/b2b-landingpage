/**
 * No-op email adapter — UAT/dev: KHÔNG gửi thật (tránh cần relay + không lộ PII).
 * Chỉ ghi log (đã redact) rằng "đã bỏ qua gửi".
 */
import type { EmailMessage, EmailPort, EmailResult } from './types';
import { logger } from '../logger';

export class NoopEmailAdapter implements EmailPort {
  readonly name = 'noop';

  async send(message: EmailMessage): Promise<EmailResult> {
    logger.info('email.noop.skipped', {
      to: message.to,
      subject: message.subject,
    });
    return { ok: true, info: 'noop: không gửi thật (UAT/dev)' };
  }
}
