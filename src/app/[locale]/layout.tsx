import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Mytel B2B — Enterprise Solutions',
  description: 'Mytel B2B ecosystem: Connectivity · Cloud & Data Center · Cyber Security · IoT · Digital Services.',
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
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Material Symbols Outlined — icon font cho giao diện v3 (ligature). */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block"
        />
        {/* Đặt cờ trước khi vẽ: chỉ ẩn [data-reveal] khi có JS (chống nháy, no-JS vẫn hiện đủ). */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js-reveal')" }} />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
