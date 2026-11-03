import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';
import { getCspConnectOrigins } from './src/lib/csp';

const withNextIntl = createNextIntlPlugin();

// The API (and the realtime socket.io upgrade) live on another origin, so
// `connect-src` must allow it explicitly. Derived from the same public API
// URL the client uses; falls back to the production origin when unset.
// Still report-only: after one clean console cycle, switch to enforcing.
const cspConnectSrc = ['\'self\'', ...getCspConnectOrigins(process.env.NEXT_PUBLIC_API_URL)].join(' ');

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
          {
            // Ignored by browsers on http (localhost); enforced on https.
            // No `preload` flag: that requires submission to the HSTS list.
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
          },
          {
            // Enforcing: the report-only console cycle came back clean, so
            // violations are now blocked instead of just logged. No
            // `report-uri`: there is no reporting endpoint yet.
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              `connect-src ${cspConnectSrc}`,
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);