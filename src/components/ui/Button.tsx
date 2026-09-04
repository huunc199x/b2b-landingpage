import type { ButtonHTMLAttributes } from 'react';
import styles from './ui.module.css';

type Variant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/** Nút token-hoá. Primary mặc định chữ ≥18px/700 (WCAG). Presentational — không gọi API. */
export function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
  const cls = [styles.button, styles[variant], className].filter(Boolean).join(' ');
  return <button className={cls} {...rest} />;
}
