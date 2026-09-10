import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Mytel B2B — Giải pháp doanh nghiệp',
  description: 'Hệ sinh thái dịch vụ B2B Mytel: Connectivity · ICT · Mobile.',
};

// Vercel không route được trang SSG (●) với setup [locale]+middleware này (404 DEPLOYMENT_NOT_FOUND),
// trong khi function (ƒ) như /api chạy tốt. Ép dynamic → trang thành ƒ để Vercel serve đúng.
// (On-prem Docker vốn đã chạy cả 2; đây là bù cho quirk của Vercel.)
export const dynamic = 'force-dynamic';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Bật render tĩnh cho locale này.
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
