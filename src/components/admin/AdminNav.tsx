'use client';

import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { usePathname, useParams } from 'next/navigation';
import styles from './admin.module.css';

/** SHELL-ADMIN (FR-17) — nav + đăng xuất. Đăng xuất ghi audit qua Auth.js events (index.ts). */
export function AdminNav({ email }: { email?: string | null }) {
  const t = useTranslations('admin.nav');
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'vi';
  const base = `/${locale}/admin`;

  const isActive = (seg: string) => pathname?.startsWith(`${base}/${seg}`);

  return (
    <nav className={styles.nav} aria-label="admin">
      <a href={`${base}/content`} className={isActive('content') ? styles.navActive : undefined}>
        {t('content')}
      </a>
      <a href={`${base}/leads`} className={isActive('leads') ? styles.navActive : undefined}>
        {t('leads')}
      </a>
      <span className={styles.spacer} />
      {email ? <span className={styles.email}>{email}</span> : null}
      <button
        type="button"
        className={styles.logout}
        onClick={() => signOut({ callbackUrl: `${base}/login` })}
      >
        {t('logout')}
      </button>
    </nav>
  );
}
