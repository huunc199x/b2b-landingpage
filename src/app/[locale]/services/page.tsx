import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { listByGroup } from '@/modules/service-catalog/loader';
import { routing, type AppLocale } from '@/i18n/routing';
import styles from './services.module.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'servicesPage' });
  return { title: `${t('title')} — Mytel B2B`, description: t('subtitle') };
}

/** SCR-02 — 18 dịch vụ chia 3 nhóm (7/8/3). Nội dung repo (SSR), không endpoint DB. */
export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as AppLocale;

  const [tPage, tGroups, tDetail] = await Promise.all([
    getTranslations('servicesPage'),
    getTranslations('groups'),
    getTranslations('serviceDetail'),
  ]);
  const groups = listByGroup(locale);

  return (
    <>
      <Header />
      <main>
        <section className={styles.head}>
          <div className="mt-container">
            <h1 className={styles.title}>{tPage('title')}</h1>
            <p className={styles.subtitle}>{tPage('subtitle')}</p>
          </div>
        </section>

        {groups.map((g) => (
          <section key={g.group} className={styles.section}>
            <div className="mt-container">
              <div style={{ marginBottom: 'var(--mt-space-6)' }}>
                <span className={styles.groupChip}>{tGroups(g.group)}</span>
              </div>
              <div className={styles.grid}>
                {g.services.map((s) => (
                  <Link key={s.slug} href={`/services/${s.slug}`} className={styles.card}>
                    <h3 className={styles.cardName}>{s.name}</h3>
                    <p className={styles.cardDesc}>{s.whatIs}</p>
                    <span className={styles.blockLabel}>{tDetail('ctaConsult')} →</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
