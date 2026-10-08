import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LeadForm } from '@/components/lead/LeadForm';
import { MIcon } from '@/components/ui';
import { listAll } from '@/modules/service-catalog/loader';
import { env } from '@/lib/env';
import { getPillar } from '@/content/pillars';
import { type AppLocale } from '@/i18n/routing';
import styles from '../../landing.module.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = getPillar(slug);
  if (!p) return { title: 'Not found — Mytel B2B' };
  const name = locale === 'my' ? p.nameMy : p.name;
  const intro = locale === 'my' ? p.introMy : p.intro;
  return { title: `${name} — Mytel B2B`, description: intro.slice(0, 160) };
}

/** Trang chi tiết 1 nhóm giải pháp — ảnh + mô tả + danh mục giải pháp chi tiết + form lead. */
export default async function PillarPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as AppLocale;

  const p = getPillar(slug);
  if (!p) notFound();

  const my = locale === 'my';
  const t = await getTranslations('home');
  const serviceOptions = listAll(locale).map((s) => ({ slug: s.slug, name: s.name }));

  const name = my ? p.nameMy : p.name;
  const tagline = my ? p.taglineMy : p.tagline;
  const intro = my ? p.introMy : p.intro;

  return (
    <>
      <Header />
      <main>
        {/* Hero nhóm giải pháp */}
        <section className={styles.pillarHero}>
          <div className={`mt-container ${styles.pillarHeroInner}`}>
            <div>
              <Link href="/#solutions" className={styles.pillarBack}>
                <span aria-hidden>←</span> {my ? 'ဖြေရှင်းချက်များ' : 'Solutions'}
              </Link>
              <p className={styles.eyebrow}>{my ? 'ဖြေရှင်းချက် အုပ်စု' : 'Solution group'}</p>
              <h1 className={styles.pillarTitle}>{name}</h1>
              <p className={styles.pillarIntro}>{intro}</p>
              <Link href="#lien-he" className={styles.btnPrimary}>
                {t('contactEyebrow')} <span aria-hidden>→</span>
              </Link>
            </div>
            <div className={styles.pillarHeroImg} aria-hidden>
              <MIcon name={p.icon} />
              <span className={styles.pillarHeroImgLayer} style={{ backgroundImage: `url('${p.image}')` }} />
            </div>
          </div>
        </section>

        {/* Danh mục giải pháp chi tiết */}
        <section className={styles.section}>
          <div className="mt-container">
            <div className={styles.secHead}>
              <div>
                <p className={styles.eyebrow}>{tagline}</p>
                <h2 className={styles.h2}>{my ? 'ဖြေရှင်းချက်များ' : 'Our solutions'}</h2>
              </div>
            </div>
            <div className={styles.solGrid}>
              {p.solutions.map((s) => (
                <article key={s.name} className={styles.solCard}>
                  <span className={styles.solIcon} aria-hidden>
                    <MIcon name={s.icon} />
                  </span>
                  <h3 className={styles.solTitle}>{s.name}</h3>
                  <p className={styles.solDesc}>{my ? s.descMy : s.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className={styles.ctaBand}>
          <span className={styles.ctaBandBg} aria-hidden />
          <div className={`mt-container ${styles.ctaBandInner}`}>
            <div>
              <h2 className={styles.ctaBandTitle}>{t('ctaTitle')}</h2>
              <p className={styles.ctaBandSub}>{t('ctaSub')}</p>
            </div>
            <Link href="#lien-he" className={styles.ctaBandBtn}>
              {t('ctaBtn')} <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        {/* Form lead */}
        <section id="lien-he" className={styles.section}>
          <div className={`mt-container ${styles.register}`}>
            <div className={styles.registerText}>
              <p className={styles.eyebrow}>{t('contactEyebrow')}</p>
              <h2 className={styles.h2}>{t('contactHeading')}</h2>
              <p>{t('contactSubtitle')}</p>
            </div>
            <div className={styles.formCard}>
              <LeadForm
                services={serviceOptions}
                source={`solution:${p.slug}`}
                turnstileSiteKey={env.turnstile.siteKey || undefined}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
