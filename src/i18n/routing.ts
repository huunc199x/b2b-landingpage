import { defineRouting } from 'next-intl/routing';

/**
 * Routing i18n (next-intl) — /en /vi. Khung 'my' khai nhưng CHƯA bật (NFR-05, BR-11)
 * → không liệt kê trong UI switcher (Làn 1). VI là mặc định (canvas anh Bryan).
 */
export const routing = defineRouting({
  locales: ['en', 'vi'],
  defaultLocale: 'vi',
  localePrefix: 'always',
});

export type AppLocale = (typeof routing.locales)[number];
