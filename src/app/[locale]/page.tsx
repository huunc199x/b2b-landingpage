import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import styles from './landing.module.css';

/**
 * SCR-01 Landing — KHUNG Làn 0 (hero + placeholder các section).
 * 8 section đầy đủ + khối động (FR-01/02) là việc Làn 1 (G1 Public site).
 */
export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('hero');

  return (
    <>
      <Header />
      <main>
        <section className={styles.hero}>
          <div className="mt-container">
            <h1 className={styles.heroTitle}>{t('title')}</h1>
            <p className={styles.heroSubtitle}>{t('subtitle')}</p>
          </div>
        </section>

        {/* Placeholder các section — Làn 1 lắp nội dung thật */}
        <section id="solutions" className="mt-container">
          <p className={styles.placeholder}>[Làn 1] Solutions · Industries · Why Mytel · Đăng ký tư vấn</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
