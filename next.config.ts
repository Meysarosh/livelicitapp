import type { NextConfig } from 'next';
import BundlerAnalizer from '@next/bundle-analyzer';

const withBundleAnalyzer = BundlerAnalizer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '45mb',
    },
  },
  compiler: {
    styledComponents: true,
  },
  reactCompiler: true,
};

export default withBundleAnalyzer(nextConfig);
