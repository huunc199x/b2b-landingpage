/**
 * Cổng gửi email (dependency inversion — cloud-agnostic).
 * on-prem = SMTP relay nội bộ; UAT/dev = no-op (không gửi thật).
 * Nghiệp vụ (LeadMailer ở Làn 1) chỉ phụ thuộc interface này, không phụ thuộc impl.
 */

export interface EmailMessage {
  to: string;
  from: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailResult {
  ok: boolean;
  /** Định danh message của transport (nếu có) hoặc lý do lỗi. */
  info?: string;
}

export interface EmailPort {
  readonly name: string;
  send(message: EmailMessage): Promise<EmailResult>;
}
