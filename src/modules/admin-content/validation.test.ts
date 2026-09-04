import { describe, it, expect } from 'vitest';
import { validateBlockInput, canPublish, STAT_VALUE_RE } from './validation';

describe('validateBlockInput (FR-12/13/14 — CB-001)', () => {
  it('highlight hợp lệ (EN đủ)', () => {
    const r = validateBlockInput({
      blockType: 'highlight',
      i18n: { en: { title: 'New DIA', description: 'Dedicated Internet' } },
      payload: { link: 'https://ex.example' },
    });
    expect(r.valid).toBe(true);
  });

  it('highlight thiếu title EN → lỗi', () => {
    const r = validateBlockInput({ blockType: 'highlight', i18n: { en: { description: 'x y' } } });
    expect(r.valid).toBe(false);
    expect(r.details.some((d) => d.field === 'i18n.en.title')).toBe(true);
  });

  it('link sai định dạng → lỗi', () => {
    const r = validateBlockInput({
      blockType: 'highlight',
      i18n: { en: { title: 'ab', description: 'cd' } },
      payload: { link: 'ftp://x' },
    });
    expect(r.details.some((d) => d.field === 'payload.link')).toBe(true);
  });

  it('partner cần logo', () => {
    const r = validateBlockInput({ blockType: 'partner', i18n: { en: { title: 'Acme' } }, payload: {} });
    expect(r.details.some((d) => d.field === 'payload.logoUrl')).toBe(true);
  });

  it('stat value đúng regex', () => {
    const r = validateBlockInput({
      blockType: 'stat',
      i18n: { en: { title: 'Customers' } },
      payload: { value: '1.200+' },
    });
    expect(r.valid).toBe(true);
  });

  it('stat value sai regex → lỗi', () => {
    const r = validateBlockInput({
      blockType: 'stat',
      i18n: { en: { title: 'Customers' } },
      payload: { value: 'abc' },
    });
    expect(r.details.some((d) => d.field === 'payload.value')).toBe(true);
  });

  it('sortOrder âm → lỗi', () => {
    const r = validateBlockInput({
      blockType: 'stat',
      sortOrder: -1,
      i18n: { en: { title: 'X' } },
      payload: { value: '99%' },
    });
    expect(r.details.some((d) => d.field === 'sortOrder')).toBe(true);
  });
});

describe('STAT_VALUE_RE', () => {
  it.each(['1.200+', '63', '99%', '1,234'])('hợp lệ: %s', (v) => {
    expect(STAT_VALUE_RE.test(v)).toBe(true);
  });
  it.each(['', 'abc', '12ab', '+', '%'])('không hợp lệ: %s', (v) => {
    expect(STAT_VALUE_RE.test(v)).toBe(false);
  });
});

describe('canPublish (CB-010 publishGuard)', () => {
  it('highlight cần title + description EN', () => {
    expect(canPublish('highlight', { title: 'ab', description: 'cd' }, {})).toBe(true);
    expect(canPublish('highlight', { title: 'ab' }, {})).toBe(false);
  });
  it('partner cần title + logoUrl', () => {
    expect(canPublish('partner', { title: 'Acme' }, { logoUrl: '/l.png' })).toBe(true);
    expect(canPublish('partner', { title: 'Acme' }, {})).toBe(false);
  });
  it('stat cần title (≥2) + value regex', () => {
    expect(canPublish('stat', { title: 'Cust' }, { value: '1.200+' })).toBe(true);
    expect(canPublish('stat', { title: 'Cust' }, { value: 'x' })).toBe(false);
    expect(canPublish('stat', { title: 'C' }, { value: '1.200+' })).toBe(false); // title < 2
  });
});
