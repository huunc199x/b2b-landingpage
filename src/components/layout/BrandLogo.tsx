'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './layout.module.css';

/**
 * BrandLogo — ô bo góc nền cam + logo Mytel trắng bên trong (design SCR-01).
 * Fallback graceful: nếu ảnh `/assets/mytel-mark-white.png` chưa có/404 → ẩn <img>,
 * lộ chữ "M" trắng làm nền dưới trong ô cam → không vỡ layout.
 * Dùng cho cả Header (nền sáng) và Footer (nền tối) — logo trắng hợp cả hai.
 *
 * A11y: ô bọc aria-hidden vì tên thương hiệu "mytel"/"Mytel" đã có ở text kề bên
 * (tránh đọc lặp), img vẫn giữ alt="Mytel" theo design.
 */
export function BrandLogo() {
  const [imgOk, setImgOk] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  // Bắt trường hợp ảnh 404 NGAY khi mount: sự kiện onError có thể đã bắn trước khi
  // React hydrate (SSR) nên handler onError không chạy → tự kiểm tra naturalWidth.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setImgOk(false);
  }, []);

  return (
    <span className={styles.brandLogoBox} aria-hidden>
      <span className={styles.brandLogoFallback}>M</span>
      {imgOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src="/assets/mytel-mark-white.png"
          alt="Mytel"
          className={styles.brandLogoImg}
          onError={() => setImgOk(false)}
        />
      ) : null}
    </span>
  );
}
