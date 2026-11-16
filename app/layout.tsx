import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import { Geist_Mono, Instrument_Sans, Inter } from 'next/font/google';
import './global.css';

const sans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
});

const display = Inter({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-inter',
});

const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://docs.shopperphp.com'),
  title: {
    template: '%s | Shopper',
    default: 'Shopper Documentation',
  },
  description: 'Documentation for Shopper, the open-source headless e-commerce package for Laravel.',
  icons: '/favicon.svg',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-9999 focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:outline-hidden"
        >
          Skip to content
        </a>
        <RootProvider search={{ enabled: false }}>{children}</RootProvider>
      </body>
    </html>
  );
}
