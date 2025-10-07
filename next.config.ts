import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
  },
  transpilePackages: [
    'sanity',
    '@sanity/vision',
    'next-sanity',
  ],
};

export default nextConfig;
