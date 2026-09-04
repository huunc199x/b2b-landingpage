/**
 * Factory chọn email adapter theo ENV (EMAIL_TRANSPORT=smtp|noop).
 * Điểm duy nhất quyết định impl — đổi đích chỉ đổi ENV, không sửa nghiệp vụ.
 */
import type { EmailPort } from './types';
import { NoopEmailAdapter } from './noop';
import { SmtpEmailAdapter } from './smtp';
import { env } from '../env';

let instance: EmailPort | undefined;

export function getEmailAdapter(): EmailPort {
  if (!instance) {
    instance = env.emailTransport === 'smtp' ? new SmtpEmailAdapter() : new NoopEmailAdapter();
  }
  return instance;
}

export type { EmailPort, EmailMessage, EmailResult } from './types';
