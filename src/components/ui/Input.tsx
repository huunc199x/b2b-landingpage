import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';
import styles from './ui.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/** Ô nhập token-hoá, có <label> thật (a11y) + dòng lỗi chữ (không chỉ màu). */
export function Input({ label, error, className, id, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputCls = [styles.input, error ? styles.inputError : null, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.field}>
      {label ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={inputCls}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {error ? <span className={styles.errorText}>{error}</span> : null}
    </div>
  );
}
