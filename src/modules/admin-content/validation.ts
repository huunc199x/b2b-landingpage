/**
 * Validate khối nội dung động theo loại (SRS FR-12/13/14, FSD SCR-08). Hàm thuần — unit test được.
 * CB-001 = lỗi validate trường; CB-010 = bật hiển thị khi thiếu trường EN bắt buộc (publishGuard).
 */
import type { FieldError } from '@/modules/lead/validation';

export type BlockType = 'highlight' | 'partner' | 'stat';

export interface BlockI18nInput {
  title?: string | null;
  description?: string | null;
}

export interface BlockInput {
  blockType: BlockType;
  sortOrder?: number;
  payload?: Record<string, unknown>;
  i18n?: {
    en?: BlockI18nInput;
    vi?: BlockI18nInput;
  };
}

export const STAT_VALUE_RE = /^(?=.*[0-9])[0-9.,]{1,19}[+%]?$/;
const LINK_RE = /^https?:\/\/.+/i;

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function checkLen(
  val: string,
  min: number,
  max: number,
  field: string,
  message: string,
  details: FieldError[],
  required: boolean,
): void {
  if (val === '') {
    if (required) details.push({ field, message });
    return;
  }
  if (val.length < min || val.length > max) details.push({ field, message });
}

/** Validate toàn bộ input tạo/sửa khối. sortOrder ≥ 0. Trả details rỗng nếu hợp lệ (CB-001). */
export function validateBlockInput(input: BlockInput): { valid: boolean; details: FieldError[] } {
  const details: FieldError[] = [];
  const en = input.i18n?.en ?? {};
  const vi = input.i18n?.vi ?? {};
  const payload = input.payload ?? {};

  if (input.sortOrder !== undefined) {
    if (!Number.isInteger(input.sortOrder) || input.sortOrder < 0) {
      details.push({ field: 'sortOrder', message: 'Thứ tự là số nguyên ≥ 0' });
    }
  }

  const link = str(payload.link);
  if (link !== '' && (!LINK_RE.test(link) || link.length > 500)) {
    details.push({ field: 'payload.link', message: 'Link phải bắt đầu bằng http:// hoặc https://' });
  }

  switch (input.blockType) {
    case 'highlight': {
      checkLen(str(en.title), 2, 120, 'i18n.en.title', 'Tiêu đề EN bắt buộc (2–120 ký tự)', details, true);
      checkLen(str(en.description), 2, 300, 'i18n.en.description', 'Mô tả EN bắt buộc (2–300 ký tự)', details, true);
      checkLen(str(vi.title), 2, 120, 'i18n.vi.title', 'Tiêu đề VI tối đa 120 ký tự', details, false);
      checkLen(str(vi.description), 2, 300, 'i18n.vi.description', 'Mô tả VI tối đa 300 ký tự', details, false);
      break;
    }
    case 'partner': {
      checkLen(str(en.title), 2, 120, 'i18n.en.title', 'Tên đối tác bắt buộc (2–120 ký tự)', details, true);
      if (str(payload.logoUrl) === '') {
        details.push({ field: 'payload.logoUrl', message: 'Logo đối tác bắt buộc' });
      }
      break;
    }
    case 'stat': {
      checkLen(str(en.title), 2, 80, 'i18n.en.title', 'Nhãn EN bắt buộc (2–80 ký tự)', details, true);
      checkLen(str(vi.title), 2, 80, 'i18n.vi.title', 'Nhãn VI tối đa 80 ký tự', details, false);
      const value = str(payload.value);
      if (value === '' || !STAT_VALUE_RE.test(value)) {
        details.push({
          field: 'payload.value',
          message: 'Giá trị chỉ gồm chữ số và dấu ngăn cách, hậu tố + hoặc % (vd: 1.200+, 63, 99%); tối đa 20 ký tự',
        });
      }
      checkLen(str(en.description), 1, 30, 'i18n.en.description', 'Đơn vị EN tối đa 30 ký tự', details, false);
      checkLen(str(vi.description), 1, 30, 'i18n.vi.description', 'Đơn vị VI tối đa 30 ký tự', details, false);
      break;
    }
    default:
      details.push({ field: 'blockType', message: 'Loại khối không hợp lệ' });
  }

  return { valid: details.length === 0, details };
}

/**
 * PublishGuard (CB-010): kiểm đủ trường EN bắt buộc trước khi chuyển sang `visible`.
 * Dùng khi bật hiển thị (visibility action=show) hoặc "Lưu & Bật hiển thị".
 */
export function canPublish(
  blockType: BlockType,
  en: BlockI18nInput | undefined,
  payload: Record<string, unknown> | undefined,
): boolean {
  const e = en ?? {};
  const p = payload ?? {};
  switch (blockType) {
    case 'highlight':
      return str(e.title).length >= 2 && str(e.description).length >= 2;
    case 'partner':
      return str(e.title).length >= 2 && str(p.logoUrl) !== '';
    case 'stat':
      return str(e.title).length >= 2 && STAT_VALUE_RE.test(str(p.value));
    default:
      return false;
  }
}
