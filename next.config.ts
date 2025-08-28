/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8083/api/v1/:path*', // Proxy tới backend NestJS
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8083',
        pathname: '/images/**',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },

};

module.exports = nextConfig;