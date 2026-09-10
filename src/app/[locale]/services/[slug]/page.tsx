import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LeadForm } from '@/components/lead/LeadForm';
import { getBySlug, listAll } from '@/modules/service-catalog/loader';
import { SERVICE_SLUGS } from '@/content/services';
import { routing, type AppLocale } from '@/i18n/routing';
import styles from '../services.module.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const svc = getBySlug(slug, locale as AppLocale);
  if (!svc) return { title: 'Not found — Mytel B2B' };
  return { title: `${svc.name} — Mytel B2B`, description: svc.whatIs.slice(0, 160) };
}

/** SCR-03 — template chi tiết dịch vụ (7 trường, ẩn Price Policy). Slug sai → 404 (FR-05 1a). */
export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as AppLocale;

  const svc = getBySlug(slug, locale);
  if (!svc) notFound();

  const [tGroups, tDetail] = await Promise.all([
    getTranslations('groups'),
    getTranslations('serviceDetail'),
  ]);
  const serviceOptions = listAll(locale).map((s) => ({ slug: s.slug, name: s.name }));

  const blocks: { key: keyof typeof svc; labelKey: string }[] = [
    { key: 'whatIs', labelKey: 'whatIs' },
    { key: 'advantage', labelKey: 'advantage' },
    { key: 'targetCustomer', labelKey: 'targetCustomer' },
    { key: 'targetSale', labelKey: 'targetSale' },
    { key: 'deliveryTimeline', labelKey: 'deliveryTimeline' },
  ];

  return (
    <>
      <Header />
      <main>
        <div className={`mt-container ${styles.detail}`}>
          <div>
            <p className={styles.breadcrumb}>
              <Link href="/services">{tDetail('breadcrumbServices')}</Link> ·{' '}
              <span className={styles.groupChip}>{tGroups(svc.group)}</span>
            </p>
            <h1 className={styles.detailTitle}>{svc.name}</h1>
            {blocks.map((b) => (
              <div key={b.key} className={styles.block}>
                <p className={styles.blockLabel}>{tDetail(b.labelKey)}</p>
                <p className={styles.blockText}>{String(svc[b.key])}</p>
              </div>
            ))}
          </div>

          {/* CTA card — thay Price Policy (ẩn, Q3); form prefill dịch vụ này (FR-06) */}
          <aside className={styles.ctaCard}>
            <h2 className={styles.ctaCardTitle}>{tDetail('ctaConsult')}</h2>
            <LeadForm services={serviceOptions} defaultService={svc.slug} source={`service:${svc.slug}`} />
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
