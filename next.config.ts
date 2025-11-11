/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Lấy backend URL từ environment variable hoặc sử dụng default
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://be-vang.onrender.com';
    
    // Trong production (Vercel), sử dụng rewrites để proxy requests và tránh CORS
    // Trong development, vẫn có thể sử dụng rewrites hoặc gọi trực tiếp
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/v1/:path*`, // Proxy tất cả API requests đến backend
      },
      {
        source: '/uploads/:path*', // proxy tất cả file media từ bucket Supabase
        destination: `${backendUrl}/uploads/:path*`,
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
        hostname: 'be-vang.onrender.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'xjbbkjfsuibvxpatijcj.supabase.co', // Domain Supabase của bạn
        pathname: '/storage/v1/object/public/**', // Cho phép tất cả các bucket (Chef, Restaurant, Video, uploads, v.v.)
      }
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

module.exports = nextConfig;
