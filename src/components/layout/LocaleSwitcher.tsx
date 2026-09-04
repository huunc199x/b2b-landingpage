'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { routing } from '@/i18n/routing';
import styles from './layout.module.css';

/**
 * SCR-05 — Đổi ngôn ngữ VI ↔ EN (FR-03). Giữ nguyên trang hiện tại, chỉ đổi tiền tố locale.
 * MY ẩn (BR-11) — chỉ liệt kê routing.locales (en/vi). Giữ dữ liệu form: chuyển trang cùng route
 * (client state form ở component form không reset khi chỉ đổi locale segment của URL nội bộ).
 */
export function LocaleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const current = (params?.locale as string) ?? routing.defaultLocale;

  return (
    <div className={styles.localeSwitch} role="group" aria-label="Language">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          className={loc === current ? styles.localeActive : styles.localeBtn}
          aria-current={loc === current ? 'true' : undefined}
          onClick={() => router.replace(pathname, { locale: loc })}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
