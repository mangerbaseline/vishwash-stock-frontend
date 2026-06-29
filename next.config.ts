import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Only apply localhost rewrites in development
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5000/api/:path*',
        },
        {
          source: '/ws/:path*',
          destination: 'http://localhost:5000/ws/:path*',
        },
      ];
    }
    
    // In production (Vercel), no rewrites needed - API calls go to the actual backend URL
    return [];
  },
};

export default nextConfig;