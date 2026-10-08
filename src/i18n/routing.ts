import { defineRouting } from 'next-intl/routing';

/**
 * Routing i18n (next-intl) — /en /my. Hai ngôn ngữ: English + Myanmar (Burmese).
 * EN là mặc định; chữ Myanmar dùng CHUNG font với tiếng Anh (fallback font hệ điều hành).
 */
export const routing = defineRouting({
  locales: ['en', 'my'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

export type AppLocale = (typeof routing.locales)[number];
