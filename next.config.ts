import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  compiler: { styledComponents: true },
  typedRoutes: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '45mb',
    },
  },
  images: {
    //TODO: restrict it later, specify exact CDNs (e.g. S3, Cloudinary).
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
