import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  // Mark packages that use Node.js APIs as server-only
  serverExternalPackages: ['@ordo-todo/core'],
  transpilePackages: [
    "@ordo-todo/ui",
    "@ordo-todo/styles",
    "@ordo-todo/hooks",
    "@ordo-todo/stores",
    "@ordo-todo/online-status",
    "@ordo-todo/auth-provider",
    "@ordo-todo/api-client",
    "@ordo-todo/validations",
  ],

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

      // NOTE: do NOT override config.optimization.splitChunks here.
      // A previous wholesale override (chunks: 'all' + enforce cacheGroups)
      // detached CSS files from their entry chunks: Next then emitted page
      // CSS in the HTML as `<script async src="...css">`, which browsers
      // refuse to execute ("MIME type text/css is not executable") and
      // pages rendered unstyled in production (seen on /login and
      // /connect/authorize after the 2026-10-26 deploy). Next's own
      // splitChunks config is correct for its chunk/CSS manifest; if vendor
      // grouping is ever re-added, verify with:
      //   curl -s http://localhost:PORT/es/login | grep -c '<script[^>]*\.css'   # must be 0

    }

    // Force single instance of core libraries
    const rootNodeModules = path.resolve(__dirname, '../../node_modules');
    // config.resolve.alias = {
    //   ...config.resolve.alias,
    //   '@tanstack/react-query': path.resolve(rootNodeModules, '@tanstack/react-query'),
    //   'react': path.resolve(rootNodeModules, 'react'),
    //   'react-dom': path.resolve(rootNodeModules, 'react-dom'),
    // };

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