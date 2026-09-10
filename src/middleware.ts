import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

/**
 * Middleware CHỈ định tuyến i18n (next-intl) — pattern canonical, tương thích Vercel.
 * Bảo vệ admin đã ở server-side (defense-in-depth):
 *  - Trang admin: `(protected)/layout.tsx` gọi `auth()` → redirect /login nếu chưa đăng nhập.
 *  - API admin: route handler dùng `requireAdmin()` → 401/403.
 * (Trước đây bọc next-intl trong NextAuth `auth()` làm Vercel không route được trang public
 *  → 404 DEPLOYMENT_NOT_FOUND; gỡ bọc để trả lại rewrite i18n nguyên vẹn cho Vercel.)
 */
export default createMiddleware(routing);

export const config = {
  // next-intl canonical: bỏ qua /api, /_next, /_vercel và file tĩnh (có dấu chấm).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
