import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // For Next.js 15+
  serverExternalPackages: [],
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
