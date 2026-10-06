import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LeadForm } from '@/components/lead/LeadForm';
import { MIcon } from '@/components/ui';
import { CountUp } from '@/components/ui/CountUp';
import { IndustryExplorer } from '@/components/home/IndustryExplorer';
import { EcosystemOrbit } from '@/components/home/EcosystemOrbit';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { listByGroup, listAll } from '@/modules/service-catalog/loader';
import { getVisibleBlocks } from '@/modules/public-site/blocks';
import { env } from '@/lib/env';
import type { AppLocale } from '@/i18n/routing';
import type { ServiceGroup } from '@/content/services/types';
import styles from './landing.module.css';

// Icon Material Symbols theo nhóm dịch vụ thật (18 dịch vụ / 3 nhóm).
const GROUP_MICON: Record<ServiceGroup, string> = {
  connectivity: 'cell_tower',
  ict_service: 'cloud',
  mobile_ict: 'smartphone',
};

const WHY = [
  { icon: 'cell_tower', t: 't1', d: 'd1' },
  { icon: 'groups', t: 't2', d: 'd2' },
  { icon: 'settings_suggest', t: 't3', d: 'd3' },
  { icon: 'handshake', t: 't4', d: 'd4' },
] as const;

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

  const [t, tGroups] = await Promise.all([
    getTranslations('home'),
    getTranslations('groups'),
  ]);

  const groups = listByGroup(locale);
  const serviceOptions = listAll(locale).map((s) => ({ slug: s.slug, name: s.name }));

  const [highlights, partners, stats] = await Promise.all([
    getVisibleBlocks(locale, 'highlight'),
    getVisibleBlocks(locale, 'partner'),
    getVisibleBlocks(locale, 'stat'),
  ]);

  return (
    <>
      <Header />
      <main>
        {/* [2] HERO */}
        <section className={styles.hero}>
          <div className={`mt-container ${styles.heroInner}`}>
            <div>
              <p className={styles.heroEyebrow}>
                {t('heroEyebrow1')}
                <br />
                {t('heroEyebrow2')}
              </p>
              <h1 className={styles.heroTitle}>
                <span>{t('heroTitle1')}</span>
                <span>{t('heroTitle2')}</span>
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
            {/* Ảnh minh hoạ hệ sinh thái (v3 hero phải). */}
            <div className={styles.heroVisual} aria-hidden>
              <span className={styles.heroImg} />
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
              alt={locale === 'vi' ? 'Các nhóm dịch vụ chính của Mytel B2B' : 'Mytel B2B main services'}
            />
          </div>
        </div>

        {/* [4] SOLUTIONS — 3 nhóm dịch vụ thật */}
        <section id="solutions" className={styles.section}>
          <div className="mt-container" data-reveal>
            <div className={styles.secHead}>
              <div>
                <p className={styles.eyebrow}>{t('solutionsEyebrow')}</p>
                <h2 className={styles.h2}>{t('solutionsHeading')}</h2>
              </div>
              <Link href="/services" className={styles.secLink}>
                {t('viewAll')} <span aria-hidden>→</span>
              </Link>
            </div>
            <div className={styles.solGrid}>
              {groups.map((g) => (
                <article key={g.group} className={styles.solCard}>
                  <span className={styles.solIcon} aria-hidden>
                    <MIcon name={GROUP_MICON[g.group]} />
                  </span>
                  <h3 className={styles.solTitle}>{tGroups(g.group)}</h3>
                  <p className={styles.solDesc}>{tGroups(`${g.group}Tagline`)}</p>
                  <div className={styles.chips}>
                    {g.services.map((s) => (
                      <Link key={s.slug} href={`/services/${s.slug}`} className={styles.chip}>
                        {s.name}
                      </Link>
                    ))}
                  </div>
                  <Link href="/services" className={styles.cardCta}>
                    {t('viewAll')} <span aria-hidden>→</span>
                  </Link>
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

        {/* [5] INDUSTRIES — tương tác */}
        <section id="industries" className={`${styles.section} ${styles.sectionAlt}`}>
          <div className="mt-container" data-reveal>
            <div className={styles.secHead}>
              <div>
                <p className={styles.eyebrow}>{t('industriesEyebrow')}</p>
                <h2 className={styles.h2}>{t('industriesHeading')}</h2>
              </div>
              <p className={styles.lead}>{t('industriesLead')}</p>
            </div>
            <IndustryExplorer locale={locale === 'vi' ? 'vi' : 'en'} ctaLabel={t('industriesCta')} />
          </div>
        </section>

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

        {/* [7] WHY MYTEL — 4 card giá trị + số động (nếu có) */}
        <section id="why" className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={`mt-container ${styles.whyInner}`} data-reveal>
            <div>
              <p className={styles.eyebrow}>{t('whyEyebrow')}</p>
              <h2 className={styles.h2}>
                {t('whyHeading1')}
                <br />
                {t('whyHeading2')}
              </h2>
            </div>
            <div className={styles.whyGrid}>
              {WHY.map((w) => (
                <div key={w.t} className={styles.whyCard}>
                  <span className={styles.whyIcon} aria-hidden>
                    <MIcon name={w.icon} />
                  </span>
                  <h3 className={styles.whyTitle}>{t(`why.${w.t}`)}</h3>
                  <p className={styles.whyDesc}>{t(`why.${w.d}`)}</p>
                </div>
              ))}
            </div>
          </div>
          {stats.length > 0 ? (
            <div className="mt-container" data-reveal>
              <div className={styles.stats}>
                {stats.map((s) => (
                  <div key={s.id} className={styles.statItem}>
                    <CountUp
                      value={typeof s.payload.value === 'string' ? s.payload.value : '—'}
                      className={styles.statValue}
                    />
                    <div className={styles.statLabel}>{s.description ? `${s.title} · ${s.description}` : s.title}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
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
