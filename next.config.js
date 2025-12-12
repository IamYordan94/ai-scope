/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compression is enabled by default in Next.js
  compress: true,
  
  images: {
    domains: ['images.unsplash.com', 'logo.clearbit.com', 'www.google.com', 'logo.clearbit.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: false,
    // Enable modern image formats
    formats: ['image/avif', 'image/webp'],
  },
  
  // Optimize production builds
  swcMinify: true,
}

module.exports = nextConfig
