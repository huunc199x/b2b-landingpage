/**
 * Validate form lead theo SRS FR-07 (bảng validate từng trường) + bảng quyết định 8 tổ hợp.
 * Hàm THUẦN (không I/O) để unit test được. Thông điệp lỗi lấy đúng cột "Thông báo lỗi" của SRS FR-07.
 * Tên trường canonical khớp api-spec §3.1 / LLD.
 */
import { SERVICE_SLUGS } from '@/content/services';

export interface RawLeadInput {
  contactName?: unknown;
  email?: unknown;
  phone?: unknown;
  companyName?: unknown;
  serviceInterest?: unknown;
  message?: unknown;
  consent?: unknown;
  consentTextVersion?: unknown;
  website?: unknown; // honeypot
  turnstileToken?: unknown;
}

export interface CleanLead {
  contactName: string;
  email: string;
  phone: string;
  companyName: string;
  serviceInterest: string;
  message: string | null;
  consent: boolean;
  consentTextVersion: string;
}

export interface FieldError {
  field: string;
  message: string;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^\+?\d{8,15}$/;

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

/**
 * Validate 6 trường nhập + consentTextVersion (KHÔNG kiểm consent/honeypot ở đây — xử lý ở pipeline).
 * Trả details[] rỗng nếu hợp lệ. serviceInterest ∈ 18 slug hoặc 'general'.
 */
export function validateLeadFields(raw: RawLeadInput): {
  valid: boolean;
  details: FieldError[];
  data: CleanLead | null;
} {
  const details: FieldError[] = [];

  const contactName = asString(raw.contactName).trim();
  if (contactName.length < 2 || contactName.length > 100) {
    details.push({ field: 'contactName', message: 'Vui lòng nhập họ tên (2–100 ký tự)' });
  }

  const email = asString(raw.email).trim();
  if (email.length > 150 || !EMAIL_RE.test(email)) {
    details.push({ field: 'email', message: 'Email không đúng định dạng' });
  }

  const phone = asString(raw.phone).trim();
  if (!PHONE_RE.test(phone)) {
    details.push({ field: 'phone', message: 'Số điện thoại chỉ gồm 8–15 chữ số' });
  }

  const companyName = asString(raw.companyName).trim();
  if (companyName.length < 2 || companyName.length > 150) {
    details.push({
      field: 'companyName',
      message: 'Vui lòng nhập tên doanh nghiệp (2–150 ký tự)',
    });
  }

  const serviceInterest = asString(raw.serviceInterest).trim();
  const serviceOk = serviceInterest === 'general' || SERVICE_SLUGS.includes(serviceInterest);
  if (!serviceOk) {
    details.push({ field: 'serviceInterest', message: 'Vui lòng chọn dịch vụ quan tâm' });
  }

  const messageRaw = asString(raw.message);
  const message = messageRaw.trim() === '' ? null : messageRaw.trim();
  if (message !== null && message.length > 1000) {
    details.push({ field: 'message', message: 'Lời nhắn tối đa 1000 ký tự' });
  }

  const consent = raw.consent === true;
  const consentTextVersion = asString(raw.consentTextVersion).trim() || 'v1';

  if (details.length > 0) {
    return { valid: false, details, data: null };
  }

  return {
    valid: true,
    details: [],
    data: { contactName, email, phone, companyName, serviceInterest, message, consent, consentTextVersion },
  };
}

/** Honeypot (FR-10): trường ẩn `website` phải rỗng; ≠ rỗng → xử lý như bot. */
export function isHoneypotTriggered(raw: RawLeadInput): boolean {
  return asString(raw.website).trim() !== '';
}

export type LeadDecisionCode = 'OK' | 'LEAD-001' | 'LEAD-010' | 'LEAD-021';

/**
 * Bảng quyết định SRS FR-07 (thứ tự ưu tiên theo pipeline api-spec §3.1:
 * antiSpam (honeypot+rate-limit) → validate trường → consent).
 * `antiSpamOk=false` nghĩa là vượt rate-limit (honeypot xử lý riêng, trả 200 giả — không qua đây).
 */
export function decideLead(input: {
  fieldsValid: boolean;
  consent: boolean;
  antiSpamOk: boolean;
}): LeadDecisionCode {
  if (!input.antiSpamOk) return 'LEAD-021';
  if (!input.fieldsValid) return 'LEAD-001';
  if (!input.consent) return 'LEAD-010';
  return 'OK';
}
