import type { Metadata } from "next";

import localFont from "next/font/local";
import { GridOverlay, PageTransition } from "./components";
import "./globals.css";


const recitalBook = localFont({
  src: "../assets/Recital-Book.woff2",
  variable: "--font-recital-book",
});

const SHOW_GRID = false;

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
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
