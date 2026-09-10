'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Icon } from '@/components/ui';
import { LocaleSwitcher } from './LocaleSwitcher';
import styles from './layout.module.css';

/**
 * MobileMenu (SCR-01 [1] · responsive ≤767px) — hamburger + drawer.
 * Chỉ hiển thị trên mobile (CSS ẩn ≥768px); nav desktop giữ nguyên.
 * A11y: nút có aria-expanded/aria-controls, đóng bằng Esc, khóa scroll nền khi mở.
 */
export function MobileMenu() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Đóng menu khi điều hướng sang trang khác.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Esc để đóng + khóa cuộn nền khi mở.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className={styles.mobileMenu}>
      <button
        type="button"
        className={styles.hamburger}
        aria-expanded={open}
        aria-controls="mobile-drawer"
        aria-label={open ? tc('close') : tc('menu')}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name={open ? 'close' : 'menu'} size={24} />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className={styles.drawerScrim}
            aria-label={tc('close')}
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <div id="mobile-drawer" className={styles.drawer} role="dialog" aria-modal="true" aria-label={tc('menu')}>
            <nav className={styles.drawerNav} aria-label="mobile">
              <Link href="/#solutions" onClick={() => setOpen(false)}>{t('solutions')}</Link>
              <Link href="/#industries" onClick={() => setOpen(false)}>{t('industries')}</Link>
              <Link href="/#why" onClick={() => setOpen(false)}>{t('why')}</Link>
              <Link href="/#dang-ky" onClick={() => setOpen(false)}>{t('register')}</Link>
            </nav>
            <div className={styles.drawerFooter}>
              <LocaleSwitcher />
              <Link href="/#dang-ky" className={styles.cta} onClick={() => setOpen(false)}>
                {tc('talkToExpert')}
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
