import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from './LocaleSwitcher';
import { MobileMenu } from './MobileMenu';
import styles from './layout.module.css';

/**
 * Header sticky (SCR-01 [1]) — blur, nav + toggle ngôn ngữ (SCR-05) + CTA.
 * Anchor trỏ tới section trên trang chủ; từ trang con dùng đường dẫn tuyệt đối về `/#...`.
 */
export async function Header() {
  const t = await getTranslations('nav');
  const tc = await getTranslations('common');

  return (
    <header className={styles.header}>
      <div className={`mt-container ${styles.headerInner}`}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark}>mytel</span>
          <span className={styles.brandTag}>B2B</span>
        </Link>
        <nav className={styles.nav} aria-label="primary">
          <Link href="/#solutions">{t('solutions')}</Link>
          <Link href="/#industries">{t('industries')}</Link>
          <Link href="/#why">{t('why')}</Link>
          <Link href="/#dang-ky">{t('register')}</Link>
        </nav>
        <div className={styles.headerActions}>
          <LocaleSwitcher />
          <Link href="/#dang-ky" className={styles.cta}>
            {tc('talkToExpert')}
          </Link>
        </div>
        <MobileMenu />
      </div>
    </header>
  );
}
