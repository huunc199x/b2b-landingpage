/**
 * Bảng mã lỗi canonical (LLD §8) — code → HTTP status → message (vi).
 * Envelope error.code = mã SRS (LEAD-xxx / AUTH-xxx / CB-xxx / SYS-xxx).
 * Dùng chung cho mọi route handler (Làn 0 sở hữu — các làn sau read-only).
 */

export type ErrorCode =
  | 'LEAD-001'
  | 'LEAD-010'
  | 'LEAD-021'
  | 'LEAD-030'
  | 'AUTH-001'
  | 'AUTH-010'
  | 'AUTH-020'
  | 'AUTH-401'
  | 'AUTH-403'
  | 'CB-001'
  | 'CB-010'
  | 'CB-404'
  | 'SYS-500';

interface ErrorDef {
  http: number;
  message: string;
}

export const ERROR_CATALOG: Record<ErrorCode, ErrorDef> = {
  'LEAD-001': { http: 400, message: 'Vui lòng kiểm tra lại thông tin đã nhập' },
  'LEAD-010': {
    http: 400,
    message: 'Vui lòng đồng ý cho phép xử lý dữ liệu cá nhân trước khi gửi',
  },
  'LEAD-021': {
    http: 429,
    message: 'Bạn đã gửi quá số lần cho phép, vui lòng thử lại sau 1 giờ',
  },
  'LEAD-030': { http: 500, message: 'Hệ thống đang bận, vui lòng thử lại' },
  'AUTH-001': { http: 401, message: 'Email hoặc mật khẩu không đúng' },
  'AUTH-010': { http: 423, message: 'Tài khoản tạm khóa, thử lại sau 15 phút' },
  'AUTH-020': { http: 401, message: 'Phiên đã hết hạn, vui lòng đăng nhập lại' },
  'AUTH-401': { http: 401, message: 'Vui lòng đăng nhập' },
  'AUTH-403': { http: 403, message: 'Bạn không có quyền thực hiện' },
  'CB-001': { http: 400, message: 'Dữ liệu khối nội dung không hợp lệ' },
  'CB-010': {
    http: 422,
    message: 'Cần đủ trường tiếng Anh bắt buộc trước khi hiển thị',
  },
  'CB-404': { http: 404, message: 'Không tìm thấy nội dung' },
  'SYS-500': { http: 500, message: 'Đã có lỗi xảy ra, vui lòng thử lại' },
};

/** Lỗi nghiệp vụ có mã — ném ở tầng service, map sang envelope ở route handler. */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly http: number;
  readonly details?: Array<{ field: string; message: string }>;

  constructor(
    code: ErrorCode,
    details?: Array<{ field: string; message: string }>,
    messageOverride?: string,
  ) {
    const def = ERROR_CATALOG[code];
    super(messageOverride ?? def.message);
    this.code = code;
    this.http = def.http;
    this.details = details;
    this.name = 'AppError';
  }
}
