import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // For Next.js 15+
  serverExternalPackages: ['got-scraping', 'header-generator', 'http2-wrapper', 'tough-cookie', 'playwright', 'playwright-core'],
  serverActions: {
    bodySizeLimit: '50mb',
  },
  // For Next.js 14
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
