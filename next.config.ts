import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  // trailing slash needed for Capacitor file:// protocol compatibility
  trailingSlash: true,
};

export default nextConfig;
