import { redirect } from 'next/navigation';

/** /admin → chuyển sang danh sách khối nội dung (SCR-07). */
export default async function AdminIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/admin/content`);
}
