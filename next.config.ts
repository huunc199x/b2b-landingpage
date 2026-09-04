import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Đường dẫn cấu hình request của next-intl (i18n động theo locale).
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Cloud-agnostic (ràng buộc V11): chạy được cả Docker on-prem lẫn Vercel.
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  // KHÔNG dùng primitive khóa cứng Vercel (edge-only / @vercel/*).
};

export default withNextIntl(nextConfig);
