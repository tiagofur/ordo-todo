import "../globals.css";
import { Montserrat } from "next/font/google";
import type { Viewport } from "next";
import { Providers } from "@/components/providers";
import { PWAProvider } from "@/components/providers/pwa-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { WebVitalsReporter } from "@/components/analytics/web-vitals";
import { defaultMetadata } from "@/lib/seo";

const font = Montserrat({
  subsets: ["latin"],
});

// Export comprehensive SEO metadata
export const metadata = {
  ...defaultMetadata,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ordo-Todo",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Ordo-Todo",
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />

        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${font.className} antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <PWAProvider>
            <Providers>
              <WebVitalsReporter />
              {children}
            </Providers>
          </PWAProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
