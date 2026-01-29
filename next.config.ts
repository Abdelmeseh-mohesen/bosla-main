import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable strict mode for faster dev builds (can enable for production)
  reactStrictMode: false,

  // Skip type checking during development for faster builds
  typescript: {
    ignoreBuildErrors: false,
  },

  // Image optimization - Allow external images from API server
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'bosla-education.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bosla-education.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'bosla-education.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bosla-education.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Also allow unoptimized images for external sources
    unoptimized: false,
  },

  // Optimize for faster development
  experimental: {
    // Faster refresh
    optimizePackageImports: ['lucide-react', '@tanstack/react-query'],
  },

  // Reduce memory usage
  onDemandEntries: {
    // Keep pages in memory for longer
    maxInactiveAge: 60 * 1000,
    // Fewer pages kept in memory
    pagesBufferLength: 2,
  },
};

export default nextConfig;
