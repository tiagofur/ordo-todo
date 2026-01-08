import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  turbopack: {
    root: path.resolve(__dirname, '../..'),
    // Disable debug IDs and sourcemaps to avoid parsing errors in monorepo
    debugIds: false,
  },
  experimental: {
    // Disable source maps in development to avoid Turbopack parsing issues
    serverSourceMaps: false,
    // Optimize package imports for better tree shaking
    optimizePackageImports: [
      '@ordo-todo/ui',
      '@ordo-todo/hooks',
      '@ordo-todo/stores',
      'recharts',
      'date-fns',
      'lucide-react',
      'framer-motion',
      'cmdk'
    ],
  },
  // Disable production source maps to avoid build issues
  productionBrowserSourceMaps: false,
  // Mark packages that use Node.js APIs as server-only
  serverExternalPackages: ['@ordo-todo/core'],
  transpilePackages: ["@ordo-todo/ui", "@ordo-todo/styles", "@ordo-todo/hooks"],

  // Bundle optimization with webpack
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Only apply bundle optimization in production and for client bundles
    if (!dev && !isServer) {
      // Enable bundle analysis when ANALYZE_BUNDLE is set
      if (process.env.ANALYZE_BUNDLE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: '../../bundle-analysis.html',
          })
        );
      }

      // Configure splitChunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          // React ecosystem
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-is)[\\/]/,
            name: 'vendor-react',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
          // Router
          router: {
            test: /[\\/]node_modules[\\/](@next\/next|next)[\\/]/,
            name: 'vendor-router',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
          // UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](@ordo-todo|@radix-ui|lucide-react|framer-motion)[\\/]/,
            name: 'vendor-ui',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
          // Forms
          forms: {
            test: /[\\/]node_modules[\\/](react-hook-form|zod|@hookform\/resolvers)[\\/]/,
            name: 'vendor-forms',
            chunks: 'all',
            priority: 12,
            enforce: true,
          },
          // Charts and data visualization
          charts: {
            test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
            name: 'vendor-charts',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
          // Date and time utilities
          date: {
            test: /[\\/]node_modules[\\/](date-fns|dayjs|moment)[\\/]/,
            name: 'vendor-date',
            chunks: 'all',
            priority: 8,
            enforce: true,
          },
          // Query and state management
          query: {
            test: /[\\/]node_modules[\\/](@tanstack|zustand)[\\/]/,
            name: 'vendor-query',
            chunks: 'all',
            priority: 12,
            enforce: true,
          },
          // Authentication
          auth: {
            test: /[\\/]node_modules[\\/](next-auth|next-auth\/*|@auth\/*)[\\/]/,
            name: 'vendor-auth',
            chunks: 'all',
            priority: 10,
            enforce: true,
          },
        },
      };
    }

    return config;
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Static optimization
  trailingSlash: false,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);