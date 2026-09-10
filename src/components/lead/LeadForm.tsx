'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Icon } from '@/components/ui';
import styles from './leadform.module.css';

export interface ServiceOption {
  slug: string;
  name: string;
}

interface LeadFormProps {
  services: ServiceOption[];
  /** Prefill "Dịch vụ quan tâm" khi vào từ trang chi tiết (SCR-03/FR-06). */
  defaultService?: string;
  /** Nguồn phát sinh (vd 'landing' | 'service:dia'). */
  source?: string;
  turnstileSiteKey?: string;
}

type Status = 'idle' | 'loading' | 'error' | 'success';

/**
 * SCR-04 Form lead (FR-06/07/08/10). 4 trạng thái UI; errorCode → message; giữ dữ liệu khi lỗi.
 * Honeypot `website` ẩn. Client validate cơ bản; lỗi trường chi tiết lấy từ error.details[] của server.
 */
export function LeadForm({ services, defaultService, source, turnstileSiteKey }: LeadFormProps) {
  const t = useTranslations('form');
  const [status, setStatus] = useState<Status>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setFormError(null);
    setFieldErrors({});

    const fd = new FormData(e.currentTarget);
    const payload = {
      contactName: String(fd.get('contactName') ?? ''),
      email: String(fd.get('email') ?? ''),
      phone: String(fd.get('phone') ?? ''),
      companyName: String(fd.get('companyName') ?? ''),
      serviceInterest: String(fd.get('serviceInterest') ?? ''),
      message: String(fd.get('message') ?? ''),
      consent: fd.get('consent') === 'on',
      consentTextVersion: 'v1',
      website: String(fd.get('website') ?? ''), // honeypot
      turnstileToken: String(fd.get('cf-turnstile-response') ?? ''),
      source: source ?? 'landing',
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (body?.success) {
        setStatus('success');
        return;
      }
      const code: string = body?.error?.code ?? 'LEAD-030';
      const details: { field: string; message: string }[] = body?.error?.details ?? [];
      if (details.length > 0) {
        const map: Record<string, string> = {};
        for (const d of details) map[d.field] = d.message;
        setFieldErrors(map);
      }
      setFormError(
        t.has(`errors.${code}`) ? t(`errors.${code}` as never) : t('errors.LEAD-030'),
      );
      setStatus('error');
    } catch {
      setFormError(t('errors.network'));
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.thanks} role="status">
        <div className={styles.thanksIcon} aria-hidden><Icon name="check" size={28} /></div>
        <h3 className={styles.thanksTitle}>{t('thanksTitle')}</h3>
        <p>{t('thanks')}</p>
      </div>
    );
  }

  const loading = status === 'loading';

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <Field name="contactName" label={t('contactName')} error={fieldErrors.contactName} required autoComplete="name" />
      <Field name="email" label={t('email')} type="email" error={fieldErrors.email} required autoComplete="email" />
      <Field name="phone" label={t('phone')} type="tel" error={fieldErrors.phone} required autoComplete="tel" />
      <Field name="companyName" label={t('companyName')} error={fieldErrors.companyName} required autoComplete="organization" />

      <div className={styles.field}>
        <label className={styles.label} htmlFor="serviceInterest">{t('serviceInterest')}</label>
        <select
          id="serviceInterest"
          name="serviceInterest"
          className={styles.select}
          defaultValue={defaultService ?? 'general'}
          required
        >
          <option value="general">{t('general')}</option>
          {services.map((s) => (
            <option key={s.slug} value={s.slug}>{s.name}</option>
          ))}
        </select>
        {fieldErrors.serviceInterest ? <span className={styles.errorText}>{fieldErrors.serviceInterest}</span> : null}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="message">
          {t('message')} <span className={styles.optional}>({t('optional')})</span>
        </label>
        <textarea id="message" name="message" className={styles.textarea} rows={4} maxLength={1000} />
        {fieldErrors.message ? <span className={styles.errorText}>{fieldErrors.message}</span> : null}
      </div>

      <label className={styles.consent}>
        <input type="checkbox" name="consent" required />
        <span>{t('consent')}</span>
      </label>

      {/* Honeypot — ẩn với người thật (FR-10). */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {turnstileSiteKey ? (
        <div className="cf-turnstile" data-sitekey={turnstileSiteKey} />
      ) : null}

      {formError ? <p className={styles.formError} role="alert">{formError}</p> : null}

      <Button type="submit" disabled={loading}>
        {loading ? t('sending') : t('send')}
      </Button>
    </form>
  );
}

function Field({
  name,
  label,
  error,
  type = 'text',
  required,
  autoComplete,
}: {
  name: string;
  label: string;
  error?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        className={error ? `${styles.input} ${styles.inputError}` : styles.input}
        aria-invalid={error ? true : undefined}
        required={required}
        autoComplete={autoComplete}
      />
      {error ? <span className={styles.errorText}>{error}</span> : null}
    </div>
  );
}
