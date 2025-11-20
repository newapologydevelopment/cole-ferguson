import type { Metadata } from 'next';

import localFont from 'next/font/local';
import Link from 'next/link';
import { GridOverlay, MenuMobile, Preloader } from './components';
import './globals.css';

const recitalBook = localFont({
  src: '../assets/Recital-Book.woff2',
  variable: '--font-recital-book',
  display: 'swap',
});

const SHOW_GRID = !true;
const SHOW_PRELOADER = true;

export const metadata: Metadata = {
  title: 'Cole Ferguson',
  description: '...',
  // metadataBase: new URL("https://coleferguson.com"),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Cole Ferguson',
    description: 'Made by New Apology.',
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
    description: 'Made by New Apology.',
    creator: 'NAP',
    images: ['/share.jpg'],
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
  // Canonical URL is automatically generated from metadataBase
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
        {SHOW_GRID && <GridOverlay />}
        {SHOW_PRELOADER && <Preloader />}
        <Link
          href="/"
          className="fixed z-[10001] md:top-[24px] top-[20px] md:left-[24px] left-[20px] text-[12px] text-primary-dark cursor-pointer bg-white hidden xl:block hover:text-[#717171] transition-colors duration-300"
          data-hide-cursor="true"
          data-brand-header
        >
          Cole Ferguson
        </Link>
        {/* <div className="fixed right-[20px] top-[20px] text-[12px] text-primary-dark md:hidden">Menu</div> */}
        <MenuMobile />
        <main>{children}</main>
      </body>
    </html>
  );
}
