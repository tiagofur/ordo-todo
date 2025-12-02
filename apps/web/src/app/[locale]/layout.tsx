import "../globals.css";
import { Montserrat } from "next/font/google";
import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { PWAProvider } from "@/components/providers/pwa-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const font = Montserrat({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ordo-Todo",
  description: "The Modern Task Organization Platform",
  manifest: "/manifest.json",
  themeColor: "#4F46E5",
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ordo-Todo",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Ordo-Todo",
    "mobile-web-app-capable": "yes",
  },
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
        <meta name="theme-color" content="#4F46E5" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${font.className} antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <PWAProvider>
            <Providers>{children}</Providers>
          </PWAProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
