import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Đường dẫn cấu hình request của next-intl (i18n động theo locale).
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * SEC-02: Content-Security-Policy hợp lý cho Next.js (App Router) + Cloudflare Turnstile.
 * - Giữ 'unsafe-inline'/'unsafe-eval' cho script/style để KHÔNG phá inline bootstrap + HMR mà Next cần
 *   (siết bằng nonce là việc hardening sau — B5). Cho phép domain Turnstile (script + iframe + connect).
 * - HSTS đặt ở Nginx prod (kết thúc TLS), không đặt ở tầng app.
 */
const TURNSTILE = 'https://challenges.cloudflare.com';
const csp = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
  `frame-ancestors 'none'`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${TURNSTILE}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: https:`,
  `font-src 'self' data:`,
  `connect-src 'self' ${TURNSTILE}`,
  `frame-src ${TURNSTILE}`,
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

const nextConfig: NextConfig = {
  // Cloud-agnostic (ràng buộc V11): chạy được cả Docker on-prem lẫn Vercel.
  // 'standalone' CHỈ cho Docker/on-prem (server.js). TRÊN VERCEL phải để Vercel
  // tự lo output — nếu bật 'standalone' trên Vercel sẽ vỡ routing trang (SSG/page → 404,
  // trong khi /api vẫn chạy). Vercel tự set process.env.VERCEL.
  output: process.env.VERCEL ? undefined : 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  // KHÔNG dùng primitive khóa cứng Vercel (edge-only / @vercel/*).
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
