/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8083/api/v1/:path*', // Proxy tới backend NestJS
      },
      {
        source: '/uploads/:path*', // proxy tất cả file media từ bucket Supabase
        destination: 'http://localhost:8083/uploads/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8083',
        pathname: '/uploads/**', // ảnh từ backend hoặc Supabase
      },
      {
        protocol: 'https',
        hostname: 'your-supabase-project-id.supabase.co',
        port: '', // không cần port
        pathname: '/storage/v1/object/public/uploads/**',
      }
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

module.exports = nextConfig;
