import type { HTMLAttributes } from 'react';
import styles from './ui.module.css';

type Tone = 'visible' | 'draft' | 'hidden' | 'danger';

const toneClass: Record<Tone, string> = {
  visible: styles.badgeVisible!,
  draft: styles.badgeDraft!,
  hidden: styles.badgeHidden!,
  danger: styles.badgeDanger!,
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

/** Nhãn trạng thái — luôn KÈM CHỮ (không truyền nghĩa chỉ bằng màu — WCAG §10.2). */
export function Badge({ tone = 'draft', className, children, ...rest }: BadgeProps) {
  const cls = [styles.badge, toneClass[tone], className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
}
