import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'path';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  experimental: {
    // Disable source map warnings for Next.js internal files
    serverSourceMaps: false,
  },
};

export default withNextIntl(nextConfig);

