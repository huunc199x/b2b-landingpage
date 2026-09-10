import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from './LocaleSwitcher';
import { BrandLogo } from './BrandLogo';
import styles from './layout.module.css';

/** Footer (SCR-01 [8]) — nền tối, 4 cột liên kết + hàng meta + đổi ngôn ngữ. */
export async function Footer() {
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const tc = await getTranslations('common');
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="mt-container">
        <div className={styles.footerCols}>
          <div>
            <span className={styles.footerBrandRow}>
              <BrandLogo />
              <span className={styles.footerBrand}>{tc('brand')}</span>
            </span>
            <p className={styles.footerTagline}>{t('tagline')}</p>
          </div>
          <nav className={styles.footerCol} aria-label="footer-solutions">
            <span className={styles.footerColTitle}>{t('colSolutions')}</span>
            <Link href="/services">{tNav('solutions')}</Link>
            <Link href="/#industries">{tNav('industries')}</Link>
            <Link href="/#why">{tNav('why')}</Link>
          </nav>
          <nav className={styles.footerCol} aria-label="footer-support">
            <span className={styles.footerColTitle}>{t('colSupport')}</span>
            <Link href="/#dang-ky">{tNav('register')}</Link>
          </nav>
          <div className={styles.footerCol}>
            <span className={styles.footerColTitle}>{t('colResources')}</span>
            <LocaleSwitcher />
          </div>
        </div>
        <div className={styles.footerMeta}>
          <span>© {year} Mytel · {t('rights')}</span>
          <span>{t('privacy')} · {t('terms')}</span>
        </div>
      </div>
    </footer>
  );
}
