/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Lấy backend URL từ environment variable hoặc sử dụng default
    let backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://be-vang.onrender.com';
    
    // Remove trailing slashes and ensure it doesn't already have /api/v1
    backendUrl = backendUrl.replace(/\/+$/, '');
    
    // If backendUrl already includes /api/v1, remove it to avoid duplication
    if (backendUrl.includes('/api/v1')) {
      backendUrl = backendUrl.replace(/\/api\/v1.*$/, '');
    }
    
    // Trong production (Vercel), sử dụng rewrites để proxy requests và tránh CORS
    // Trong development, vẫn có thể sử dụng rewrites hoặc gọi trực tiếp
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/v1/:path*`, // Proxy tất cả API requests đến backend với /api/v1 prefix
      },
      {
        source: '/uploads/:path*', // proxy tất cả file media từ bucket Supabase
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
  images: {
    // Tắt hoàn toàn image optimization để tránh lỗi với Supabase trên Vercel
    // Next.js sẽ không optimize bất kỳ ảnh nào, load trực tiếp từ source
    unoptimized: true,
    // Disable image optimization completely - không cần remotePatterns khi unoptimized: true
    // Nhưng vẫn giữ để tương thích nếu có thay đổi sau này
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8083',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'be-vang.onrender.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'xjbbkjfsuibvxpatijcj.supabase.co',
        pathname: '/storage/v1/object/public/**',
      }
    ],
  },
};

module.exports = nextConfig;
