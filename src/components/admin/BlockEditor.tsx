'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import styles from './admin.module.css';

type BlockType = 'highlight' | 'partner' | 'stat';

interface EditorState {
  blockType: BlockType;
  sortOrder: number;
  enTitle: string;
  enDesc: string;
  viTitle: string;
  viDesc: string;
  imageUrl: string;
  logoUrl: string;
  link: string;
  value: string;
}

const EMPTY: EditorState = {
  blockType: 'highlight',
  sortOrder: 0,
  enTitle: '', enDesc: '', viTitle: '', viDesc: '',
  imageUrl: '', logoUrl: '', link: '', value: '',
};

/** SCR-08 — Thêm/Sửa khối 3 loại đa ngữ. blockId có = chế độ Sửa (khóa loại). */
export function BlockEditor({ blockId }: { blockId?: string }) {
  const t = useTranslations('admin.editor');
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) ?? 'vi';
  const base = `/${locale}/admin`;

  const [s, setS] = useState<EditorState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!blockId) return;
    void (async () => {
      const res = await fetch(`/api/admin/content-blocks/${blockId}`);
      const body = await res.json();
      if (body?.success) {
        const d = body.data;
        const p = d.payload ?? {};
        setS({
          blockType: d.blockType,
          sortOrder: d.sortOrder,
          enTitle: d.i18n.en?.title ?? '',
          enDesc: d.i18n.en?.description ?? '',
          viTitle: d.i18n.vi?.title ?? '',
          viDesc: d.i18n.vi?.description ?? '',
          imageUrl: p.imageUrl ?? '',
          logoUrl: p.logoUrl ?? '',
          link: p.link ?? '',
          value: p.value ?? '',
        });
      }
    })();
  }, [blockId]);

  function set<K extends keyof EditorState>(k: K, v: EditorState[K]) {
    setS((prev) => ({ ...prev, [k]: v }));
  }

  function buildBody() {
    const payload: Record<string, string> = {};
    if (s.blockType === 'highlight') {
      if (s.imageUrl) payload.imageUrl = s.imageUrl;
      if (s.link) payload.link = s.link;
    } else if (s.blockType === 'partner') {
      if (s.logoUrl) payload.logoUrl = s.logoUrl;
      if (s.link) payload.link = s.link;
    } else {
      if (s.value) payload.value = s.value;
    }
    return {
      blockType: s.blockType,
      sortOrder: Number(s.sortOrder) || 0,
      payload,
      i18n: {
        en: { title: s.enTitle, description: s.enDesc },
        vi: { title: s.viTitle, description: s.viDesc },
      },
    };
  }

  async function save(publish: boolean) {
    setBusy(true);
    setErrors({});
    setMsg(null);
    const body = buildBody();
    try {
      const url = blockId ? `/api/admin/content-blocks/${blockId}` : '/api/admin/content-blocks';
      const method = blockId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const saved = await res.json();
      if (!saved?.success) {
        applyErrors(saved);
        setBusy(false);
        return;
      }
      const id = blockId ?? saved.data.id;
      if (publish) {
        const vis = await fetch(`/api/admin/content-blocks/${id}/visibility`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'show' }),
        });
        const visBody = await vis.json();
        if (!visBody?.success) {
          setMsg({ text: visBody?.error?.message ?? t('requiredEn'), ok: false });
          setBusy(false);
          return;
        }
      }
      router.push(`${base}/content`);
    } catch {
      setMsg({ text: t('requiredEn'), ok: false });
      setBusy(false);
    }
  }

  function applyErrors(body: { error?: { message?: string; details?: { field: string; message: string }[] } }) {
    const map: Record<string, string> = {};
    for (const d of body.error?.details ?? []) map[d.field] = d.message;
    setErrors(map);
    setMsg({ text: body.error?.message ?? '', ok: false });
  }

  return (
    <section>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>{blockId ? t('editTitle') : t('createTitle')}</h1>
      </div>

      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>{t('type')}</label>
          <select
            className={styles.input}
            value={s.blockType}
            disabled={!!blockId}
            onChange={(e) => set('blockType', e.target.value as BlockType)}
          >
            <option value="highlight">Highlight</option>
            <option value="partner">Partner</option>
            <option value="stat">Stat</option>
          </select>
        </div>

        {/* Trường theo loại */}
        {s.blockType !== 'partner' ? (
          <div className={styles.grid2}>
            <Text label={`${t('titleField')} (EN)`} value={s.enTitle} onChange={(v) => set('enTitle', v)} error={errors['i18n.en.title']} />
            <Text label={`${t('titleField')} (VI)`} value={s.viTitle} onChange={(v) => set('viTitle', v)} error={errors['i18n.vi.title']} />
          </div>
        ) : (
          <Text label={t('partnerName')} value={s.enTitle} onChange={(v) => set('enTitle', v)} error={errors['i18n.en.title']} />
        )}

        {s.blockType === 'highlight' ? (
          <>
            <div className={styles.grid2}>
              <Text label={`${t('description')} (EN)`} value={s.enDesc} onChange={(v) => set('enDesc', v)} error={errors['i18n.en.description']} />
              <Text label={`${t('description')} (VI)`} value={s.viDesc} onChange={(v) => set('viDesc', v)} error={errors['i18n.vi.description']} />
            </div>
            <Text label={t('imageUrl')} value={s.imageUrl} onChange={(v) => set('imageUrl', v)} />
            <Text label={t('link')} value={s.link} onChange={(v) => set('link', v)} error={errors['payload.link']} />
          </>
        ) : null}

        {s.blockType === 'partner' ? (
          <>
            <Text label={t('logoUrl')} value={s.logoUrl} onChange={(v) => set('logoUrl', v)} error={errors['payload.logoUrl']} />
            <Text label={t('link')} value={s.link} onChange={(v) => set('link', v)} error={errors['payload.link']} />
          </>
        ) : null}

        {s.blockType === 'stat' ? (
          <>
            <Text label={t('value')} value={s.value} onChange={(v) => set('value', v)} error={errors['payload.value']} />
            <div className={styles.grid2}>
              <Text label={`${t('unit')} (EN)`} value={s.enDesc} onChange={(v) => set('enDesc', v)} error={errors['i18n.en.description']} />
              <Text label={`${t('unit')} (VI)`} value={s.viDesc} onChange={(v) => set('viDesc', v)} error={errors['i18n.vi.description']} />
            </div>
          </>
        ) : null}

        <Text label={t('sortOrder')} value={String(s.sortOrder)} onChange={(v) => set('sortOrder', Number(v) || 0)} error={errors.sortOrder} type="number" />

        {msg ? <p className={`${styles.msg} ${msg.ok ? styles.msgOk : styles.msgErr}`}>{msg.text}</p> : null}

        <div className={styles.formActions}>
          <button className={styles.logout} disabled={busy} onClick={() => void save(false)}>{t('saveDraft')}</button>
          <button className={styles.logout} disabled={busy} onClick={() => void save(true)}>{t('savePublish')}</button>
          <a className={styles.btnSm} href={`${base}/content`}>{t('cancel')}</a>
        </div>
      </div>
    </section>
  );
}

function Text({
  label,
  value,
  onChange,
  error,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <input className={styles.input} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      {error ? <span className={styles.errorText}>{error}</span> : null}
    </div>
  );
}
