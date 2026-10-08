import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from './LocaleSwitcher';
import { MobileMenu } from './MobileMenu';
import { BrandLogo } from './BrandLogo';
import styles from './layout.module.css';

/**
 * Header sticky (SCR-01 v3) — logo + wordmark, nav 5 mục, toggle ngôn ngữ + CTA.
 * Anchor trỏ section trên trang chủ; từ trang con dùng đường dẫn tuyệt đối `/#...`.
 */
export async function Header() {
  const t = await getTranslations('nav');
  const tc = await getTranslations('common');

  return (
    <header className={styles.header}>
      <div className={`mt-container ${styles.headerInner}`}>
        <Link href="/" className={styles.brand} aria-label="Mytel">
          <BrandLogo alt="" />
        </Link>
        <nav className={styles.nav} aria-label="primary">
          <Link href="/#solutions">{t('solutions')}</Link>
          <Link href="/#ecosystem">{t('ecosystem')}</Link>
          <Link href="/#dang-ky">{t('contact')}</Link>
        </nav>
        <div className={styles.headerActions}>
          <LocaleSwitcher />
          <Link href="/#dang-ky" className={styles.cta}>
            {tc('talkToExpert')} <span aria-hidden>→</span>
          </Link>
        </div>
        <MobileMenu />
      </div>
    </header>
  );
}
