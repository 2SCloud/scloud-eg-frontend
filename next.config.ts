import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for the Docker standalone build (copies only the necessary files)
  output: 'standalone',
};

export default nextConfig;
