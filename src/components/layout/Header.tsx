import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import styles from './layout.module.css';

/**
 * Header khung (Làn 0) — sticky, blur, nav + CTA. Chi tiết responsive/hamburger + toggle
 * ngôn ngữ đầy đủ là việc Làn 1 (SCR-01/SCR-05).
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
          <a href="#solutions">{t('solutions')}</a>
          <a href="#industries">{t('industries')}</a>
          <a href="#why">{t('why')}</a>
          <a href="#dang-ky">{t('register')}</a>
        </nav>
        <a href="#dang-ky" className={styles.cta}>
          {tc('talkToExpert')}
        </a>
      </div>
    </header>
  );
}
