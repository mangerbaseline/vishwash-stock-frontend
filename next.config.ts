import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // In development, proxy API through localhost
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5000/api/:path*',
        },
      ];
    }
    
    // In production, use the environment variable if available
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL;
    if (backendUrl) {
      return [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
      ];
    }
    
    return [];
  },
};

export default nextConfig;