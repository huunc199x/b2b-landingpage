import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { BrandLogo } from './BrandLogo';
import styles from './layout.module.css';

/** Footer (SCR-01 v3) — nền sáng: brand + tagline · nav · social/copyright. */
export async function Footer() {
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`mt-container ${styles.footerInner}`}>
        <div className={styles.footerBrandCol}>
          <span className={styles.brand}>
            <BrandLogo size={40} />
          </span>
          <span className={styles.footerTagline}>{t('tagline')}</span>
        </div>

        <nav className={styles.footerNav} aria-label="footer">
          <Link href="/#solutions">{tNav('solutions')}</Link>
          <Link href="/#industries">{tNav('industries')}</Link>
          <Link href="/#ecosystem">{tNav('ecosystem')}</Link>
          <Link href="/#why">{tNav('why')}</Link>
          <Link href="/#dang-ky">{tNav('contact')}</Link>
        </nav>

        <div className={styles.footerMeta}>
          <span className={styles.footerSocial} aria-hidden>
            <span>in</span>
            <span>f</span>
            <span>▶</span>
          </span>
          <span>© {year} Mytel · {t('rights')}</span>
        </div>
      </div>
    </footer>
  );
}
