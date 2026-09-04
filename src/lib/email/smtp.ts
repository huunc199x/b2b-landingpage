/**
 * SMTP email adapter (Nodemailer) — on-prem relay nội bộ Mytel.
 * Timeout mặc định 5s (LLD §8). Retry để tầng nghiệp vụ (Làn 1) quản.
 */
import nodemailer, { type Transporter } from 'nodemailer';
import type { EmailMessage, EmailPort, EmailResult } from './types';
import { env } from '../env';
import { logger } from '../logger';

export class SmtpEmailAdapter implements EmailPort {
  readonly name = 'smtp';
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth:
        env.smtp.user && env.smtp.password
          ? { user: env.smtp.user, pass: env.smtp.password }
          : undefined,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });
  }

  async send(message: EmailMessage): Promise<EmailResult> {
    try {
      const info = await this.transporter.sendMail({
        to: message.to,
        from: message.from,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
      return { ok: true, info: info.messageId };
    } catch (err) {
      logger.error('email.smtp.failed', {
        subject: message.subject,
        reason: err instanceof Error ? err.message : 'unknown',
      });
      return { ok: false, info: err instanceof Error ? err.message : 'unknown' };
    }
  }
}
