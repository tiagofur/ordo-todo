import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: path.resolve(__dirname, '../..'),
    // Disable debug IDs and sourcemaps to avoid parsing errors in monorepo
    debugIds: false,
  },
  experimental: {
    // Disable source maps in development to avoid Turbopack parsing issues
    serverSourceMaps: false,
  },
  // Disable production source maps to avoid build issues
  productionBrowserSourceMaps: false,
};

export default withNextIntl(nextConfig);

