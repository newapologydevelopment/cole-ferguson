import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
  },
  transpilePackages: [
    'sanity',
    '@sanity/vision',
    'next-sanity',
  ],
};

export default nextConfig;
