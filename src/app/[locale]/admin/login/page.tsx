'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';

/**
 * SCR-06 Admin login (FR-16). Thông báo lỗi CHUNG (không lộ trường sai — AUTH-001).
 * Tài khoản khóa (AUTH-010) hiển thị nếu runtime trả `code`; nếu không, degrade về thông báo chung.
 * Lockout 5/15 + audit thực thi ở server (lib/auth authorize).
 */
export default function AdminLoginPage() {
  const t = useTranslations('admin.login');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'vi';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      const code = (res as { code?: string }).code;
      setError(code === 'AUTH-010' ? t('errorLocked') : t('errorGeneric'));
    } else {
      window.location.href = `/${locale}/admin`;
    }
  }

  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 24 }}>
      <Card style={{ width: 400, maxWidth: '100%' }}>
        <h1 style={{ fontSize: 22, marginTop: 0 }}>{t('title')}</h1>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label={t('email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
          <Input
            label={t('password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {error ? (
            <span role="alert" style={{ color: 'var(--color-danger)', fontSize: 13 }}>
              {error}
            </span>
          ) : null}
          <Button type="submit" disabled={loading}>
            {loading ? '…' : t('submit')}
          </Button>
        </form>
      </Card>
    </main>
  );
}
