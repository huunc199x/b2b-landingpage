import { describe, it, expect } from 'vitest';
import {
  validateLeadFields,
  isHoneypotTriggered,
  decideLead,
  type RawLeadInput,
} from './validation';

const base: RawLeadInput = {
  contactName: 'Le Van A',
  email: 'a@cty.com',
  phone: '0912345678',
  companyName: 'Cong ty A',
  serviceInterest: 'dia',
  message: 'Can bao gia',
  consent: true,
  consentTextVersion: 'v1',
  website: '',
};

describe('validateLeadFields (FR-07)', () => {
  it('chấp nhận input hợp lệ', () => {
    const r = validateLeadFields(base);
    expect(r.valid).toBe(true);
    expect(r.data?.serviceInterest).toBe('dia');
    expect(r.data?.message).toBe('Can bao gia');
  });

  it('chấp nhận serviceInterest "general"', () => {
    expect(validateLeadFields({ ...base, serviceInterest: 'general' }).valid).toBe(true);
  });

  it('từ chối serviceInterest ngoài danh mục', () => {
    const r = validateLeadFields({ ...base, serviceInterest: 'khong-ton-tai' });
    expect(r.valid).toBe(false);
    expect(r.details.some((d) => d.field === 'serviceInterest')).toBe(true);
  });

  it('email sai định dạng → lỗi', () => {
    const r = validateLeadFields({ ...base, email: 'a@cty' });
    expect(r.valid).toBe(false);
    expect(r.details.find((d) => d.field === 'email')?.message).toBe('Email không đúng định dạng');
  });

  it('phone < 8 chữ số → lỗi', () => {
    expect(validateLeadFields({ ...base, phone: '09123' }).valid).toBe(false);
  });

  it('phone cho phép + đầu, 8–15 chữ số', () => {
    expect(validateLeadFields({ ...base, phone: '+959123456789' }).valid).toBe(true);
  });

  it('họ tên < 2 ký tự → lỗi', () => {
    expect(validateLeadFields({ ...base, contactName: 'A' }).valid).toBe(false);
  });

  it('tên doanh nghiệp toàn khoảng trắng → lỗi', () => {
    expect(validateLeadFields({ ...base, companyName: '   ' }).valid).toBe(false);
  });

  it('message > 1000 ký tự → lỗi', () => {
    expect(validateLeadFields({ ...base, message: 'x'.repeat(1001) }).valid).toBe(false);
  });

  it('message rỗng → null (không bắt buộc)', () => {
    const r = validateLeadFields({ ...base, message: '' });
    expect(r.valid).toBe(true);
    expect(r.data?.message).toBeNull();
  });

  it('gộp nhiều lỗi cùng lúc', () => {
    const r = validateLeadFields({ ...base, email: 'x', phone: '1', contactName: '' });
    expect(r.details.length).toBeGreaterThanOrEqual(3);
  });
});

describe('honeypot (FR-10)', () => {
  it('website rỗng → không phải bot', () => {
    expect(isHoneypotTriggered(base)).toBe(false);
  });
  it('website có giá trị → bot', () => {
    expect(isHoneypotTriggered({ ...base, website: 'http://spam' })).toBe(true);
  });
});

describe('decideLead — bảng quyết định FR-07 (8 tổ hợp)', () => {
  const cases: [boolean, boolean, boolean, string][] = [
    [true, true, true, 'OK'],
    [true, true, false, 'LEAD-021'],
    [true, false, true, 'LEAD-010'],
    [true, false, false, 'LEAD-021'], // antiSpam ưu tiên theo pipeline api-spec §3.1
    [false, true, true, 'LEAD-001'],
    [false, true, false, 'LEAD-021'],
    [false, false, true, 'LEAD-001'],
    [false, false, false, 'LEAD-021'],
  ];
  it.each(cases)(
    'fields=%s consent=%s antiSpam=%s → %s',
    (fieldsValid, consent, antiSpamOk, expected) => {
      expect(decideLead({ fieldsValid, consent, antiSpamOk })).toBe(expected);
    },
  );
});
