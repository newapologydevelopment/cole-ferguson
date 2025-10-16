import type { Metadata } from "next";

import localFont from "next/font/local";
import Link from "next/link";
import { GridOverlay, PageTransition } from "./components";
import { InfoShell } from "./components/InfoShell";
import "./globals.css";


const recitalBook = localFont({
  src: "../assets/Recital-Book.woff2",
  variable: "--font-recital-book",
});

const SHOW_GRID = !true;

export const metadata: Metadata = {
  title: "Cole Ferguson",
  description: "...",
  // metadataBase: new URL("https://coleferguson.com"),
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Cole Ferguson",
    description: "Made by New Apology.",
    // url: "https://coleferguson.com/",
    siteName: "Cole Ferguson",
    // images: [
    //   {
    //     url: "/share.jpg",
    //     width: 2400,
    //     height: 1260,
    //   },
    // ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cole Ferguson",
    description: "Made by New Apology.",
    creator: "NAP",
    images: ["/share.jpg"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      // Dark mode favicon
      {
        url: "/favicon-32x32_light.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: light)",
      },
      // Light mode favicon
      {
        url: "/favicon-32x32_dark.png",
        sizes: "32x32",
        type: "image/png",
        media: "(prefers-color-scheme: dark)",
      },
    ],

  },
  // Canonical URL is automatically generated from metadataBase
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${recitalBook.className} antialiased`}
      >
        {SHOW_GRID && <GridOverlay />}
        {/* <Preloader /> */}
        <Link href="/" className="fixed z-[4] top-[24px] left-[24px] text-[12px] text-primary-dark cursor-pointer">Cole Ferguson </Link>
        <InfoShell>
          <PageTransition>
            {children}
            <div className="fixed z-[3]  md:bottom-[24px] md:left-[24px] bottom-[20px] left-[20px] flex flex-col gap-[8px] text-[12px] text-primary-dark">
              <Link href="/gallery" className="cursor-pointer">Index</Link>
              <div className=" realtive invisible w-screen pointer-events-none z-[-1]" >1</div>
            </div>
          </PageTransition>
        </InfoShell>
      </body>
    </html>
  );
}
