import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable error overlay in development
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  // Disable error overlay
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Disable webpack error overlay
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Disable webpack error overlay
      config.devServer = {
        ...config.devServer,
        client: {
          overlay: false,
        },
      }
    }
    return config
  },
};

export default nextConfig;
