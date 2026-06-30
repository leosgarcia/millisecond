import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata } from 'next'
import Header from '@/components/ui/Header'
import '../globals.css'

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = await getTranslations({locale, namespace: 'Metadata'});
  
  return {
    metadataBase: new URL('https://millisecond.vercel.app'),
    title: t('title'),
    description: t('description'),
    keywords: ['Formula 1', 'F1 histórica', 'simulação', 'jogo', 'motorsport'],
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
    },
    alternates: {
      languages: {
        'pt-BR': '/pt-BR',
        'en': '/en',
      }
    }
  };
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
 
  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <Header />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
