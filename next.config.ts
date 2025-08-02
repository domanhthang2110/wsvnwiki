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
      {
        protocol: 'https',
        hostname: 'cdn1.iconfinder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn4.iconfinder.com',
        port: '',
        pathname: '/**',
      },
      // Allow any external HTTPS image for admin flexibility
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
