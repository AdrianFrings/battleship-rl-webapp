/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* Vercel and production optimizations */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

module.exports = nextConfig;
