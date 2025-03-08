// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  // Enable progressive Web App improvements
  poweredByHeader: false,
  // Optimize image loading
  images: {
    minimumCacheTTL: 60, // Cache images for at least 60 seconds
  },
  // Optimize build output
  swcMinify: true,
  // Optimize font loading
  optimizeFonts: true,
  // Optimize webpack
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Add optimization for production builds
    if (config.mode === 'production') {
      // Ensure tree-shaking is enabled
      config.optimization = {
        ...config.optimization,
        usedExports: true,
      };
    }
    
    return config;
  },
  // Enable experimental features that are compatible with Next.js 13
  experimental: {
    // Enable optimizations for package imports
    optimizePackageImports: ['framer-motion', '@heroicons/react', '@rainbow-me/rainbowkit'],
    
    // Use loose mode for ESM externals to improve compatibility
    esmExternals: 'loose',
    
    // Force SWC transforms for better performance
    forceSwcTransforms: true
  },
};

module.exports = nextConfig;
