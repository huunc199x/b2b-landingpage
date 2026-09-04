'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from '@/components/admin/admin.module.css';

interface LeadRow {
  id: string;
  contactName: string;
  companyName: string;
  serviceInterest: string;
  status: 'new' | 'viewed';
  emailStatus: string;
  createdAt: string;
}
interface LeadDetail extends LeadRow {
  email: string;
  phone: string;
  message: string | null;
  consent: { given: boolean; consentTextVersion: string; givenAt: string } | null;
}

type Load = 'loading' | 'ok' | 'error';

export default function AdminLeadsPage() {
  const t = useTranslations('admin.leads');
  const [items, setItems] = useState<LeadRow[]>([]);
  const [state, setState] = useState<Load>('loading');
  const [statusFilter, setStatusFilter] = useState('');
  const [detail, setDetail] = useState<LeadDetail | null>(null);
  const [hasFilter, setHasFilter] = useState(false);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const q = new URLSearchParams();
      if (statusFilter) q.set('status', statusFilter);
      setHasFilter(!!statusFilter);
      const res = await fetch(`/api/admin/leads?${q.toString()}`);
      const body = await res.json();
      if (body?.success) {
        setItems(body.data.items);
        setState('ok');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  }, [statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function open(id: string) {
    const res = await fetch(`/api/admin/leads/${id}`);
    const body = await res.json();
    if (body?.success) {
      setDetail(body.data);
      // Cập nhật trạng thái hàng → Đã xem (mark viewed đã chạy server-side)
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status: 'viewed' } : it)));
    }
  }

  return (
    <section>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>{t('title')}</h1>
      </div>

      <div className={styles.toolbar}>
        <select className={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">{t('filterStatus')}: —</option>
          <option value="new">{t('statuses.new')}</option>
          <option value="viewed">{t('statuses.viewed')}</option>
        </select>
      </div>

      {state === 'loading' ? (
        <p className={styles.msg}>…</p>
      ) : state === 'error' ? (
        <div className={styles.empty}>
          <button className={styles.btnSm} onClick={() => void load()}>↻</button>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{hasFilter ? t('emptyFilter') : t('empty')}</p>
          {hasFilter ? (
            <button className={styles.btnSm} onClick={() => setStatusFilter('')}>{t('clearFilter')}</button>
          ) : (
            <p>{t('emptyHint')}</p>
          )}
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('colDate')}</th>
              <th>{t('colName')}</th>
              <th>{t('colCompany')}</th>
              <th>{t('colService')}</th>
              <th>{t('colStatus')}</th>
              <th>{t('colEmail')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className={styles.row} onClick={() => void open(it.id)}>
                <td>{new Date(it.createdAt).toLocaleString()}</td>
                <td>{it.contactName}</td>
                <td>{it.companyName}</td>
                <td>{it.serviceInterest}</td>
                <td>
                  <span className={`${styles.badge} ${it.status === 'new' ? styles.badgeNew : styles.badgeViewed}`}>
                    {t(`statuses.${it.status}`)}
                  </span>
                </td>
                <td>{it.emailStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {detail ? (
        <div className={styles.detailPanel}>
          <div className={styles.pageHead}>
            <h2 className={styles.pageTitle}>{t('detail.title')}</h2>
            <button className={styles.btnSm} onClick={() => setDetail(null)}>{t('detail.close')}</button>
          </div>
          <Row k={t('detail.contactName')} v={detail.contactName} />
          <Row k={t('detail.email')} v={detail.email} />
          <Row k={t('detail.phone')} v={detail.phone} />
          <Row k={t('detail.company')} v={detail.companyName} />
          <Row k={t('detail.service')} v={detail.serviceInterest} />
          <Row k={t('detail.message')} v={detail.message ?? '—'} />
          <Row k={t('detail.createdAt')} v={new Date(detail.createdAt).toLocaleString()} />
          <Row
            k={t('detail.consent')}
            v={detail.consent?.given ? `${t('detail.consentGiven')} (${detail.consent.consentTextVersion})` : '—'}
          />
        </div>
      ) : null}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailKey}>{k}</span>
      <span>{v}</span>
    </div>
  );
}
