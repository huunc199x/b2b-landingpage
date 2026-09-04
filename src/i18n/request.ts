import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * Cấu hình request-scoped của next-intl: chọn locale hợp lệ + nạp message store.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
