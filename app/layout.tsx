import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import { Geist_Mono, Instrument_Sans } from 'next/font/google';
import './global.css';

const sans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
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
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
