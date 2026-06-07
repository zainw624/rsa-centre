import path from 'path';

const replitDevDomain = process.env.REPLIT_DEV_DOMAIN;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        pathname: '/**',
      },
    ],
  },
  distDir: process.env.NEXT_DIST_DIR || '.next',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  outputFileTracingRoot: path.join(process.cwd(), '..'),
  allowedDevOrigins: replitDevDomain
    ? [replitDevDomain, `*.${replitDevDomain.split('.').slice(-2).join('.')}`]
    : [],
};

export default nextConfig;
