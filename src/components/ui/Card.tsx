import type { HTMLAttributes } from 'react';
import styles from './ui.module.css';

/** Card token-hoá (surface-card + radius + shadow). */
export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const cls = [styles.card, className].filter(Boolean).join(' ');
  return <div className={cls} {...rest} />;
}
