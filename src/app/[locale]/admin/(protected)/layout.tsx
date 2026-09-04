import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { AdminNav } from '@/components/admin/AdminNav';
import styles from '@/components/admin/admin.module.css';

/** SHELL-ADMIN (FR-17) — bảo vệ phiên (defense-in-depth cùng middleware) + topbar/nav/đăng xuất. */
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
  const t = await getTranslations('admin');

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <strong className={styles.brand}>{t('brand')}</strong>
        <AdminNav email={session.user?.email} />
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
