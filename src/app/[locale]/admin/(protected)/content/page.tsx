'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import styles from '@/components/admin/admin.module.css';

interface BlockItem {
  id: string;
  blockType: 'highlight' | 'partner' | 'stat';
  status: 'draft' | 'visible' | 'hidden' | 'deleted';
  sortOrder: number;
  i18n: Record<string, { title: string | null; description: string | null }>;
  updatedAt: string;
}

type Load = 'loading' | 'ok' | 'error';

export default function AdminContentPage() {
  const t = useTranslations('admin.content');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'vi';
  const base = `/${locale}/admin`;

  const [items, setItems] = useState<BlockItem[]>([]);
  const [state, setState] = useState<Load>('loading');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const q = new URLSearchParams();
      if (typeFilter) q.set('type', typeFilter);
      if (statusFilter) q.set('status', statusFilter);
      const res = await fetch(`/api/admin/content-blocks?${q.toString()}`);
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
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggle(item: BlockItem) {
    const action = item.status === 'visible' ? 'hide' : 'show';
    const res = await fetch(`/api/admin/content-blocks/${item.id}/visibility`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const body = await res.json();
    if (!body?.success) {
      setMsg(body?.error?.message ?? t('emptyHint'));
    } else {
      setMsg(null);
      void load();
    }
  }

  async function remove(item: BlockItem) {
    if (!window.confirm(t('confirmDelete'))) return;
    await fetch(`/api/admin/content-blocks/${item.id}`, { method: 'DELETE' });
    void load();
  }

  return (
    <section>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>{t('title')}</h1>
        <a href={`${base}/content/new`} className={styles.logout}>+ {t('create')}</a>
      </div>

      <div className={styles.toolbar}>
        <select className={styles.select} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">{t('filterType')}: {t('all')}</option>
          <option value="highlight">{t('types.highlight')}</option>
          <option value="partner">{t('types.partner')}</option>
          <option value="stat">{t('types.stat')}</option>
        </select>
        <select className={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">{t('filterStatus')}: {t('all')}</option>
          <option value="draft">{t('statuses.draft')}</option>
          <option value="visible">{t('statuses.visible')}</option>
          <option value="hidden">{t('statuses.hidden')}</option>
        </select>
      </div>

      {msg ? <p className={`${styles.msg} ${styles.msgErr}`}>{msg}</p> : null}

      {state === 'loading' ? (
        <p className={styles.msg}>…</p>
      ) : state === 'error' ? (
        <div className={styles.empty}>
          <p>—</p>
          <button className={styles.btnSm} onClick={() => void load()}>{t('all')}</button>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>{t('empty')}</p>
          <p>{t('emptyHint')}</p>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('colType')}</th>
              <th>{t('colTitle')}</th>
              <th>{t('colStatus')}</th>
              <th>{t('colOrder')}</th>
              <th>{t('colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{t(`types.${it.blockType}`)}</td>
                <td>{it.i18n.en?.title ?? it.i18n.vi?.title ?? '—'}</td>
                <td>
                  <span className={`${styles.badge} ${badgeClass(it.status)}`}>
                    {t(`statuses.${it.status}`)}
                  </span>
                </td>
                <td>{it.sortOrder}</td>
                <td>
                  <div className={styles.actions}>
                    <a className={styles.btnSm} href={`${base}/content/${it.id}`}>{t('edit')}</a>
                    <button className={styles.btnSm} onClick={() => void toggle(it)}>
                      {it.status === 'visible' ? t('hide') : t('show')}
                    </button>
                    <button className={`${styles.btnSm} ${styles.btnDanger}`} onClick={() => void remove(it)}>
                      {t('delete')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function badgeClass(status: string): string {
  if (status === 'visible') return styles.badgeVisible!;
  if (status === 'draft') return styles.badgeDraft!;
  return styles.badgeHidden!;
}
