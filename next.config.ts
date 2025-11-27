import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Các cấu hình khác giữ nguyên ở đây nếu có
  images: {
    // Cho phép load ảnh từ MEGA (avatar sau khi upload)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mega.nz',
        pathname: '/file/**',
      },
    ],
  },
  // Khai báo root cho Turbopack để tránh chọn sai workspace
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
