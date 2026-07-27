import type { Metadata } from 'next';

import localFont from 'next/font/local';
import Link from 'next/link';
import {
  CursorLabel,
  DesktopCursorPolicy,
  GridOverlay,
  MenuMobile,
  PageTransition,
} from './components';
import { InfoShell } from './components/InfoShell';
import { IndexLink } from './components/IndexLink';
import { InformationButton } from './components/InformationButton';
import { PreloaderGate } from './components/PreloaderGate';
import './globals.css';

const recitalBook = localFont({
  src: '../assets/Recital-Book.woff2',
  variable: '--font-recital-book',
  display: 'swap',
});

const SHOW_GRID = !true;

export const metadata: Metadata = {
  metadataBase: new URL('https://coleferguson.com'),
  title: 'Cole Ferguson',
  description:
    'Cole Ferguson is a photographer and director based in Los Angeles, California.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Cole Ferguson',
    description: 'Photographer based in California',
    // url: "https://coleferguson.com/",
    siteName: 'Cole Ferguson',
    // images: [
    //   {
    //     url: "/share.jpg",
    //     width: 2400,
    //     height: 1260,
    //   },
    // ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cole Ferguson',
    description:
      'Photographer and director based in Los Angeles, California.',
    images: ['/preloader_images/1.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      // Dark mode favicon
      {
        url: '/favicon-32x32_light.png',
        sizes: '32x32',
        type: 'image/png',
        media: '(prefers-color-scheme: light)',
      },
      // Light mode favicon
      {
        url: '/favicon-32x32_dark.png',
        sizes: '32x32',
        type: 'image/png',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preconnect"
          href="https://cdn.sanity.io"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
      </head>
      <body className={`${recitalBook.className} antialiased`}>
        <a
          href="#main-content"
          className="sr-only fixed left-[20px] top-[20px] z-[2147483647] bg-white px-3 py-2 focus:not-sr-only focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Skip to content
        </a>
        <DesktopCursorPolicy />
        <CursorLabel />
        <PreloaderGate>
          {SHOW_GRID && <GridOverlay />}
          <Link
          href="/"
          className="fixed z-[10080] md:top-[24px] top-[20px] md:left-[24px] left-[20px] text-[12px] text-primary-dark cursor-pointer bg-white hidden xl:block hover:text-[#717171] transition-colors duration-300"
          data-hide-cursor="true"
          data-brand-header
        >
          Cole Ferguson
        </Link>
        {/* <div className="fixed right-[20px] top-[20px] text-[12px] text-primary-dark md:hidden">Menu</div> */}
        <InfoShell>
          <MenuMobile />
          <PageTransition>
            <main id="main-content">{children}</main>
          </PageTransition>
        </InfoShell>
        <div
          className="fixed z-[3] md:bottom-[24px] md:left-[24px] bottom-[20px] left-[20px] flex flex-col gap-[8px] text-[12px] text-primary-dark pointer-events-none"
          data-index-container
        >
          <IndexLink />
          <div className="pointer-events-auto">
            <InformationButton />
          </div>
        </div>
        </PreloaderGate>
      </body>
    </html>
  );
}
