/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@eventhub/types'],
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  typescript: {
    // Ensure build completes smoothly on Vercel
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
