import { MytelMark } from '@/components/ui';
import styles from './layout.module.css';

/**
 * BrandLogo — ô bo góc nền cam + mark Mytel trắng (vector, design v3).
 * Dùng vector nội tuyến (MytelMark) → luôn hiển thị nét, không phụ thuộc file raster.
 * aria-hidden: tên thương hiệu "mytel" đã có ở text kề bên (tránh SR đọc lặp).
 */
export function BrandLogo({ size = 40 }: { size?: number }) {
  return (
    <span className={styles.brandLogoBox} aria-hidden style={{ width: size, height: size }}>
      <MytelMark size={Math.round(size * 0.68)} style={{ color: 'var(--text-on-brand)' }} />
    </span>
  );
}
