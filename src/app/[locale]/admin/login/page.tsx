'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Button, Input, Card } from '@/components/ui';

/**
 * SCR-06 Admin login — KHUNG Làn 0 (form tối thiểu gọi Auth.js).
 * Lockout 5/15', audit, thông báo lỗi chi tiết theo AUTH-001/010 là việc Làn 1 (G5).
 */
export default function AdminLoginPage() {
  const tc = useTranslations('common');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError('Email hoặc mật khẩu không đúng');
    } else {
      window.location.href = '/vi/admin';
    }
  }

  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 24 }}>
      <Card style={{ width: 400, maxWidth: '100%' }}>
        <h1 style={{ fontSize: 22, marginTop: 0 }}>Mytel B2B Admin</h1>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error ? <span style={{ color: 'var(--color-danger)', fontSize: 13 }}>{error}</span> : null}
          <Button type="submit" disabled={loading}>
            {loading ? tc('loading') : 'Đăng nhập'}
          </Button>
        </form>
      </Card>
    </main>
  );
}
