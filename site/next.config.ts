import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    memoryBasedWorkersCount: true,
    webpackMemoryOptimizations: true,
  },
};

export default nextConfig;
