import { getTranslations } from 'next-intl/server';
import styles from './layout.module.css';

/** Footer khung (Làn 0) — nền tối. Cột liên kết đầy đủ là việc Làn 1. */
export async function Footer() {
  const t = await getTranslations('footer');
  const tc = await getTranslations('common');
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`mt-container ${styles.footerInner}`}>
        <span className={styles.footerBrand}>{tc('brand')}</span>
        <span className={styles.footerMeta}>
          © {year} Mytel · {t('privacy')} · {t('terms')} · {t('rights')}
        </span>
      </div>
    </footer>
  );
}
