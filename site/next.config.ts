import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    memoryBasedWorkersCount: true,
    webpackMemoryOptimizations: true,
  },
  async redirects() {
    return [
      {
        source: "/learn/javascript",
        destination: "/javascript/handbook",
        permanent: true,
      },
      {
        source: "/questions",
        destination: "/javascript/q-and-a",
        permanent: true,
      },
      {
        source: "/chapters/:slug",
        destination: "/javascript/handbook/chapters/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
