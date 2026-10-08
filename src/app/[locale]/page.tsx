import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LeadForm } from '@/components/lead/LeadForm';
import { MIcon } from '@/components/ui';
import { EcosystemOrbit } from '@/components/home/EcosystemOrbit';
import { HeroFan } from '@/components/home/HeroFan';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { listAll } from '@/modules/service-catalog/loader';
import { getVisibleBlocks } from '@/modules/public-site/blocks';
import { env } from '@/lib/env';
import { INDUSTRIES } from '@/content/industries';
import type { AppLocale } from '@/i18n/routing';
import styles from './landing.module.css';

// Logo fallback = nhãn ngành trung tính (KHÔNG nêu tên thương hiệu thật → tránh mạo nhận endorsement).
const FALLBACK_LOGOS = [
  { icon: 'account_balance', name: 'Banking' },
  { icon: 'account_balance_wallet', name: 'Government' },
  { icon: 'apartment', name: 'Enterprise' },
  { icon: 'storefront', name: 'Retail' },
] as const;

/**
 * SCR-01 Landing v3 — bố cục mới (hero split · KPI · solutions · industries · ecosystem ·
 * why · trusted · CTA · form). Giữ nguyên nghiệp vụ: catalog 18 dịch vụ, form lead, khối động DB.
 */
export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as AppLocale;

  const t = await getTranslations('home');

  const serviceOptions = listAll(locale).map((s) => ({ slug: s.slug, name: s.name }));

  const [highlights, partners] = await Promise.all([
    getVisibleBlocks(locale, 'highlight'),
    getVisibleBlocks(locale, 'partner'),
  ]);

  return (
    <>
      <Header />
      <main>
        {/* [2] HERO — căn giữa: text ở trên, ảnh showcase ở giữa phía dưới */}
        <section className={styles.hero}>
          <div className={`mt-container ${styles.heroInner}`}>
            <div className={styles.heroText}>
              <p className={styles.heroEyebrow}>
                {t('heroEyebrow1')}
                <br />
                {t('heroEyebrow2')}
              </p>
              <h1 className={styles.heroTitle}>
                <span>{t('heroTitle1')}</span>{' '}
                <span>{t('heroTitle2')}</span>{' '}
                <span>{t('heroTitle3')}</span>
              </h1>
              <p className={styles.heroSubtitle}>{t('heroSubtitle')}</p>
              <div className={styles.heroCtas}>
                <Link href="/#solutions" className={styles.btnPrimary}>
                  {t('heroCtaExplore')} <span aria-hidden>→</span>
                </Link>
                <Link href="/#dang-ky" className={styles.btnGhost}>
                  {t('heroCtaTalk')}
                </Link>
              </div>
            </div>
            {/* Quạt xòe ảnh dịch vụ — bấm vào thẻ để lật ảnh đó lên trước */}
            <div className={styles.heroShowcase}>
              <HeroFan locale={locale === 'my' ? 'my' : 'en'} />
            </div>
          </div>
        </section>

        {/* [3] Dải dịch vụ chính (thay dải số 16M+…) */}
        <div className={styles.servicesStripWrap}>
          <div className="mt-container" data-reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.servicesStrip}
              src="/assets/main-services.png"
              alt="Mytel B2B main services"
            />
          </div>
        </div>

        {/* [4] SOLUTIONS theo NGÀNH — 5 hạng mục + mô tả chi tiết + danh mục dịch vụ */}
        <section id="solutions" className={styles.section}>
          <div className="mt-container" data-reveal>
            <div className={styles.secHead}>
              <div>
                <p className={styles.eyebrow}>{t('industriesEyebrow')}</p>
                <h2 className={styles.h2}>{t('solutionsHeading')}</h2>
              </div>
              <Link href="/services" className={styles.secLink}>
                {t('viewAll')} <span aria-hidden>→</span>
              </Link>
            </div>
            <div className={styles.solGrid}>
              {INDUSTRIES.map((ind) => (
                <article key={ind.key} className={styles.solCard}>
                  <span className={styles.solIcon} aria-hidden>
                    <MIcon name={ind.icon} />
                  </span>
                  <h3 className={styles.solTitle}>{locale === 'my' ? ind.nameMy : ind.name}</h3>
                  <p className={styles.solDesc}>{locale === 'my' ? ind.descMy : ind.desc}</p>
                  <ul className={styles.solServices}>
                    {ind.solutions.map((s) => (
                      <li key={s.name} className={styles.solServiceItem}>
                        <span className={styles.solServiceIcon} aria-hidden>
                          <MIcon name={s.icon} />
                        </span>
                        {s.name}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Khối động Highlight (Sản phẩm/dịch vụ mới) — ẩn cụm khi rỗng */}
        {highlights.length > 0 ? (
          <section className={`${styles.section} ${styles.sectionAlt}`}>
            <div className="mt-container" data-reveal>
              <div className={styles.highlightGrid}>
                {highlights.map((h) => (
                  <article key={h.id} className={styles.highlightCard}>
                    {typeof h.payload.imageUrl === 'string' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className={styles.highlightImg} src={h.payload.imageUrl} alt={h.title} />
                    ) : null}
                    <div className={styles.highlightBody}>
                      <h3 className={styles.solTitle}>{h.title}</h3>
                      <p className={styles.solDesc}>{h.description}</p>
                      {typeof h.payload.link === 'string' ? (
                        <a className={styles.cardCta} href={h.payload.link}>
                          {t('viewAll')} <span aria-hidden>→</span>
                        </a>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* [6] ECOSYSTEM — orbit */}
        <section id="ecosystem" className={styles.section}>
          <div className={`mt-container ${styles.ecoInner}`} data-reveal>
            <div className={styles.ecoText}>
              <p className={styles.eyebrow}>{t('ecosystemEyebrow')}</p>
              <h2>
                {t('ecosystemHeading1')}
                <br />
                {t('ecosystemHeading2')}
              </h2>
              <p>{t('ecosystemLead')}</p>
              <Link href="/#dang-ky" className={styles.btnPrimary}>
                {t('ecosystemCta')} <span aria-hidden>→</span>
              </Link>
            </div>
            <EcosystemOrbit />
          </div>
        </section>

        {/* [8] TRUSTED */}
        <section id="about" className={styles.section}>
          <div className={`mt-container ${styles.trustedInner}`} data-reveal>
            <div>
              <p className={styles.eyebrow}>{t('trustedEyebrow')}</p>
              <h2 className={styles.h2}>{t('trustedHeading')}</h2>
            </div>
            <div className={styles.logoGrid}>
              {partners.length > 0
                ? partners.map((p) => (
                    <div key={p.id} className={styles.logoCard}>
                      {typeof p.payload.logoUrl === 'string' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className={styles.logoImg} src={p.payload.logoUrl} alt={p.title} />
                      ) : (
                        <span className={styles.logoName}>{p.title}</span>
                      )}
                    </div>
                  ))
                : FALLBACK_LOGOS.map((l) => (
                    <div key={l.name} className={styles.logoCard}>
                      <span className={styles.solIcon} aria-hidden>
                        <MIcon name={l.icon} />
                      </span>
                      <span className={styles.logoName}>{l.name}</span>
                    </div>
                  ))}
            </div>
            <div className={styles.quoteCard}>
              <div className={styles.quoteMark} aria-hidden>“</div>
              <p className={styles.quoteText}>{t('quoteText')}</p>
              <div className={styles.quoteBy}>{t('quoteBy')}</div>
            </div>
          </div>
        </section>

        {/* [9] CTA band */}
        <section className={styles.ctaBand}>
          <span className={styles.ctaBandBg} aria-hidden />
          <div className={`mt-container ${styles.ctaBandInner}`} data-reveal>
            <div>
              <h2 className={styles.ctaBandTitle}>{t('ctaTitle')}</h2>
              <p className={styles.ctaBandSub}>{t('ctaSub')}</p>
            </div>
            <Link href="/#dang-ky" className={styles.ctaBandBtn}>
              {t('ctaBtn')} <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        {/* [10] REGISTER — form lead (giữ nguyên nghiệp vụ lead-gen) */}
        <section id="dang-ky" className={styles.section}>
          <div className={`mt-container ${styles.register}`} data-reveal>
            <div className={styles.registerText}>
              <p className={styles.eyebrow}>{t('contactEyebrow')}</p>
              <h2 className={styles.h2}>{t('contactHeading')}</h2>
              <p>{t('contactSubtitle')}</p>
            </div>
            <div className={styles.formCard}>
              <LeadForm
                services={serviceOptions}
                source="landing"
                turnstileSiteKey={env.turnstile.siteKey || undefined}
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}
