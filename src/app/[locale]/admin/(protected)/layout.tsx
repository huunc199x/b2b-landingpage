import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

/**
 * Vỏ admin bảo vệ (SHELL-ADMIN khung Làn 0) — defense-in-depth cùng middleware.
 * Nav/đăng xuất đầy đủ là việc Làn 1.
 */
export default async function ProtectedAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <strong style={{ color: 'var(--color-brand)' }}>mytel B2B Admin</strong>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{session.user?.email}</span>
      </header>
      <main style={{ padding: 24 }}>{children}</main>
    </div>
  );
}
