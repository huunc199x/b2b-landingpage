import createMiddleware from 'next-intl/middleware';
import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';
import { authConfig } from '@/lib/auth/config';

/**
 * Middleware kết hợp:
 *  1) Bảo vệ admin — trang /{locale}/admin/* (trừ /login) redirect login nếu chưa auth;
 *     API /api/admin/* trả 401 (envelope) nếu chưa auth.
 *  2) Định tuyến i18n next-intl cho trang public localized.
 * authConfig edge-safe (không argon2/prisma) → chạy được ở middleware runtime.
 */
const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

const ADMIN_PAGE = /^\/(en|vi)\/admin(?:\/|$)/;
const ADMIN_LOGIN = /^\/(en|vi)\/admin\/login\/?$/;

export default auth((req) => {
  const { pathname, origin } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // --- API: không localize; chặn admin API ---
  if (pathname.startsWith('/api')) {
    if (pathname.startsWith('/api/admin') && !isLoggedIn) {
      // DISC-03: hết phiên / không phiên ở API admin → AUTH-020 (theo SRS/FSD SHELL-ADMIN 2a,
      // api-spec §3.4) thay vì AUTH-401 chung, để UI đưa về đăng nhập với thông điệp "phiên hết hạn".
      return NextResponse.json(
        {
          success: false,
          error: { code: 'AUTH-020', message: 'Phiên đã hết hạn, vui lòng đăng nhập lại' },
          meta: { correlationId: '' },
        },
        { status: 401 },
      );
    }
    return NextResponse.next();
  }

  // --- Trang admin (trừ login): yêu cầu đăng nhập ---
  if (ADMIN_PAGE.test(pathname) && !ADMIN_LOGIN.test(pathname) && !isLoggedIn) {
    const locale = pathname.split('/')[1] || routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/admin/login`, origin));
  }

  // --- Còn lại: định tuyến i18n ---
  return intlMiddleware(req);
});

export const config = {
  // Bỏ qua _next, _vercel và file tĩnh (có dấu chấm). Bao gồm '/', trang locale, /api.
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
