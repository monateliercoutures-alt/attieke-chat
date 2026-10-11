/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@attieke-chat/shared'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
