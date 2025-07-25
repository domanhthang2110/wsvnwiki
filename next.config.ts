import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'faharuolmxxbavrpaktv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'forum.warspear-online.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
