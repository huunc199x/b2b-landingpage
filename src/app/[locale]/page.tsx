import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LeadForm } from '@/components/lead/LeadForm';
import { Icon } from '@/components/ui';
import { CountUp } from '@/components/ui/CountUp';
import { listByGroup, listAll } from '@/modules/service-catalog/loader';
import { getVisibleBlocks } from '@/modules/public-site/blocks';
import { env } from '@/lib/env';
import type { AppLocale } from '@/i18n/routing';
import type { ServiceGroup } from '@/content/services/types';
import type { IconName } from '@/components/ui';
import styles from './landing.module.css';

// Icon vector theo nhóm dịch vụ (thay emoji cũ) — trùng tên IconName.
const GROUP_ICON: Record<ServiceGroup, IconName> = {
  connectivity: 'connectivity',
  ict_service: 'ict_service',
  mobile_ict: 'mobile_ict',
};
const INDUSTRY_KEYS = ['carrier', 'banking', 'enterprise', 'manufacturing', 'hospitality', 'retail'] as const;

/**
 * SCR-01 Landing — 8 section (FR-01/02/06). Nội dung tĩnh i18n + catalog repo + khối động DB.
 * Khối động lỗi/rỗng → ẩn cả cụm (empty-state FR-01). Đọc DB bọc try/catch (build xanh khi chưa có DB).
 */
export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as AppLocale;

  const [tHero, tSol, tGroups, tInd, tWhy, tCta, tReg] = await Promise.all([
    getTranslations('hero'),
    getTranslations('solutions'),
    getTranslations('groups'),
    getTranslations('industries'),
    getTranslations('why'),
    getTranslations('ctaBand'),
    getTranslations('register'),
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
            <h1 className={styles.heroTitle}>{tHero('title')}</h1>
            <p className={styles.heroSubtitle}>{tHero('subtitle')}</p>
            <div className={styles.heroCtas}>
              <Link href="/#solutions" className={styles.ctaBandBtn}>{tHero('ctaExplore')} →</Link>
              <Link href="/#dang-ky" className={styles.ctaBandBtn}>{tHero('ctaExpert')}</Link>
            </div>
          </div>
        </section>

        {/* [3] SOLUTIONS */}
        <section id="solutions" className={styles.section}>
          <div className="mt-container">
            <p className={styles.eyebrow}>{tSol('eyebrow')}</p>
            <h2 className={styles.h2}>{tSol('heading')}</h2>
            <div className={styles.grid3}>
              {groups.map((g) => (
                <article key={g.group} className={`${styles.solCard} ${styles.reveal}`}>
                  <div className={styles.iconBox} aria-hidden><Icon name={GROUP_ICON[g.group]} size={26} /></div>
                  <h3 className={styles.solTitle}>{tGroups(g.group)}</h3>
                  <p className={styles.solDesc}>{tGroups(`${g.group}Tagline`)}</p>
                  <div className={styles.chips}>
                    {g.services.map((s) => (
                      <Link key={s.slug} href={`/services/${s.slug}`} className={styles.chip}>{s.name}</Link>
                    ))}
                  </div>
                  <Link href="/services" className={styles.cardCta}>{tSol('explore')} →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Khối động Highlight (FR-02) — ẩn cụm khi rỗng */}
        {highlights.length > 0 ? (
          <section className={`${styles.section} ${styles.sectionAlt}`}>
            <div className="mt-container">
              <div className={styles.highlightGrid}>
                {highlights.map((h) => (
                  <article key={h.id} className={styles.highlightCard}>
                    {typeof h.payload.imageUrl === 'string' ? (
                      <img className={styles.highlightImg} src={h.payload.imageUrl} alt={h.title} />
                    ) : null}
                    <div className={styles.highlightBody}>
                      <h3 className={styles.solTitle}>{h.title}</h3>
                      <p className={styles.solDesc}>{h.description}</p>
                      {typeof h.payload.link === 'string' ? (
                        <a className={styles.cardCta} href={h.payload.link}>{tSol('explore')} →</a>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* [4] INDUSTRIES */}
        <section id="industries" className={`${styles.section} ${styles.sectionAlt}`}>
          <div className="mt-container">
            <p className={styles.eyebrow}>{tInd('eyebrow')}</p>
            <h2 className={styles.h2}>{tInd('heading')}</h2>
            <div className={styles.grid6}>
              {INDUSTRY_KEYS.map((k) => (
                <div key={k} className={styles.industryCard}>
                  <span className={styles.iconBox} aria-hidden><Icon name={k} size={24} /></span>
                  {tInd(`items.${k}`)}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* [5] WHY MYTEL — 5 con số (4 chờ AS-04/08/13 hiển thị "—", KHÔNG bịa số) */}
        <section id="why" className={styles.section}>
          <div className="mt-container">
            <p className={styles.eyebrow}>{tWhy('eyebrow')}</p>
            <h2 className={styles.h2}>{tWhy('heading')}</h2>
            <div className={styles.stats}>
              <Stat value="18" label={tWhy('stats.services')} />
              <Stat value="—" label={tWhy('stats.customers')} />
              <Stat value="—" label={tWhy('stats.reliability')} />
              <Stat value="—" label={tWhy('stats.datacenters')} />
              <Stat value="—" label={tWhy('stats.support')} />
            </div>
            {/* Con số động (Stat block) bổ sung — chỉ khi có khối `Hiển thị` */}
            {stats.length > 0 ? (
              <div className={styles.stats} style={{ marginTop: 'var(--mt-space-12)' }}>
                {stats.map((s) => (
                  <Stat
                    key={s.id}
                    value={typeof s.payload.value === 'string' ? s.payload.value : '—'}
                    label={s.description ? `${s.title} · ${s.description}` : s.title}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </section>

        {/* [6] CTA BAND */}
        <section className={styles.ctaBand}>
          <div className={`mt-container ${styles.ctaBandInner}`}>
            <h2 className={styles.ctaBandTitle}>{tCta('heading')}</h2>
            <Link href="/#dang-ky" className={styles.ctaBandBtn}>{tCta('button')}</Link>
          </div>
        </section>

        {/* [7] REGISTER (form lead) */}
        <section id="dang-ky" className={styles.section}>
          <div className={`mt-container ${styles.register}`}>
            <div className={styles.registerText}>
              <p className={styles.eyebrow}>{tReg('eyebrow')}</p>
              <h2 className={styles.h2}>{tReg('heading')}</h2>
              <p>{tReg('subtitle')}</p>
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

        {/* Khối động Partner (FR-02) — ẩn cụm khi rỗng */}
        {partners.length > 0 ? (
          <section className={`${styles.section} ${styles.sectionAlt}`}>
            <div className="mt-container">
              <div className={styles.partnerGrid}>
                {partners.map((p) => (
                  <div key={p.id} className={styles.partnerItem}>
                    {typeof p.payload.logoUrl === 'string' ? (
                      <img className={styles.partnerLogo} src={p.payload.logoUrl} alt={p.title} />
                    ) : (
                      <span>{p.title}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className={styles.statItem}>
      <CountUp value={value} className={styles.statValue} />
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}
