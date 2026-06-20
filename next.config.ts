import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root — stray parent lockfiles confuse Next's inference.
  turbopack: { root: __dirname },
};

export default nextConfig;
