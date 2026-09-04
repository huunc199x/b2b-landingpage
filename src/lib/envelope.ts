/**
 * Envelope API (HLD §7) — KHÔNG dùng TransactionResponse (dự án Next.js).
 * Thành công: { success:true, data, meta:{correlationId} }
 * Lỗi:        { success:false, error:{code,message,details?}, meta:{correlationId} }
 */
import { NextResponse } from 'next/server';
import { AppError, ERROR_CATALOG, type ErrorCode } from './errors';
import { newCorrelationId } from './correlation';

export interface SuccessEnvelope<T> {
  success: true;
  data: T;
  meta: { correlationId: string };
}

export interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
  meta: { correlationId: string };
}

/** Trả JSON thành công (mặc định 200). */
export function ok<T>(
  data: T,
  init?: { status?: number; correlationId?: string },
): NextResponse<SuccessEnvelope<T>> {
  const correlationId = init?.correlationId ?? newCorrelationId();
  return NextResponse.json(
    { success: true, data, meta: { correlationId } },
    { status: init?.status ?? 200 },
  );
}

/** Trả JSON lỗi theo mã canonical. */
export function fail(
  code: ErrorCode,
  init?: {
    details?: Array<{ field: string; message: string }>;
    correlationId?: string;
    message?: string;
  },
): NextResponse<ErrorEnvelope> {
  const def = ERROR_CATALOG[code];
  const correlationId = init?.correlationId ?? newCorrelationId();
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message: init?.message ?? def.message,
        ...(init?.details ? { details: init.details } : {}),
      },
      meta: { correlationId },
    },
    { status: def.http },
  );
}

/** Chuẩn hoá bất kỳ lỗi nào thành envelope lỗi (AppError → mã; khác → SYS-500). */
export function failFrom(
  err: unknown,
  correlationId?: string,
): NextResponse<ErrorEnvelope> {
  if (err instanceof AppError) {
    return fail(err.code, {
      details: err.details,
      correlationId,
      message: err.message,
    });
  }
  return fail('SYS-500', { correlationId });
}
