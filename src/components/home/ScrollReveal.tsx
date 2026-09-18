'use client';

import { useEffect } from 'react';

/**
 * ScrollReveal — hiện dần khối khi cuộn tới (fade + trượt lên).
 * Dùng scroll event + getBoundingClientRect (không phụ thuộc IntersectionObserver).
 * Thêm class `is-in` cho [data-reveal] khi mép trên vào ~90% khung nhìn.
 * An toàn: trạng thái ẩn chỉ áp khi <html> có class `js-reveal` → no-JS vẫn hiện đủ.
 * Tôn trọng prefers-reduced-motion (hiện ngay, CSS bỏ transition).
 */
export function ScrollReveal() {
  useEffect(() => {
    const els = new Set(Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]')));
    if (els.size === 0) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }

    const reveal = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      els.forEach((el) => {
        if (el.getBoundingClientRect().top < vh * 0.9) {
          el.classList.add('is-in');
          els.delete(el);
        }
      });
      if (els.size === 0) teardown();
    };

    const onScroll = () => reveal();
    const teardown = () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };

    reveal(); // hiện ngay các khối đã trong khung nhìn lúc tải
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return teardown;
  }, []);

  return null;
}
