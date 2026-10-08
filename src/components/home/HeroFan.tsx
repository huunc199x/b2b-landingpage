'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { MIcon } from '@/components/ui';
import { PILLARS } from '@/content/pillars';
import styles from './hero-fan.module.css';

/**
 * HeroFan — carousel 1 ảnh lớn + 5 dấu chấm ở trang chủ. Tự chuyển cảnh (crossfade) mỗi 5s
 * (dừng khi rê chuột). Bấm vào ẢNH → mở trang chi tiết nhóm (/solutions/[slug]); bấm CHẤM → chọn ảnh.
 * Tự-lành: chưa có ảnh → nền gradient + icon + tên nhóm. Tôn trọng prefers-reduced-motion.
 */
export function HeroFan({ locale = 'en' }: { locale?: 'en' | 'my' }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const my = locale === 'my';

  // Tự chuyển cảnh mỗi 5s. Reset khi active đổi; dừng khi paused; bỏ qua nếu reduced-motion.
  useEffect(() => {
    if (paused) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % PILLARS.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [paused, active]);

  return (
    <div
      className={styles.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.stage}>
        {PILLARS.map((p, i) => {
          const isActive = i === active;
          const label = my ? p.nameMy : p.name;
          return (
            <Link
              key={p.slug}
              href={`/solutions/${p.slug}`}
              className={`${styles.slide}${isActive ? ` ${styles.slideActive}` : ''}`}
              aria-hidden={!isActive}
              tabIndex={isActive ? 0 : -1}
              aria-label={label}
            >
              <span className={styles.slideFallback} aria-hidden>
                <MIcon name={p.icon} />
                <span className={styles.slideFallbackText}>{label}</span>
              </span>
              <span className={styles.slideImg} style={{ backgroundImage: `url('${p.image}')` }} />
            </Link>
          );
        })}
      </div>

      <div className={styles.dots} role="tablist" aria-label={my ? 'ဖြေရှင်းချက် အုပ်စုများ' : 'Solution groups'}>
        {PILLARS.map((p, i) => (
          <button
            key={p.slug}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={my ? p.nameMy : p.name}
            className={`${styles.dot}${i === active ? ` ${styles.dotActive}` : ''}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </div>
  );
}
