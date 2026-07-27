import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [320, 480, 640, 960, 1280, 1600, 2000],
    imageSizes: [160, 240, 320, 360],
  },
  transpilePackages: [
    'sanity',
    '@sanity/vision',
    'next-sanity',
  ],
};

export default nextConfig;
