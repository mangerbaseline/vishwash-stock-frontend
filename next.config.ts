import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
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
  },
};

export default nextConfig;