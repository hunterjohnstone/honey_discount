import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compress: true,
  images: {
    domains: ['spanishoffers.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    ppr: true,
    clientSegmentCache: true,
    nodeMiddleware: true
  }
};

export default nextConfig;
