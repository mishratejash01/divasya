import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root — stray parent lockfiles confuse Next's inference.
  turbopack: { root: __dirname },
  // sweph is a native addon (.node) — never bundle it; let it load at runtime on
  // the Node serverless runtime. astronomy-engine (pure JS) is the fallback tier
  // if the addon can't load in a given environment, so the engine never fails.
  serverExternalPackages: ["sweph", "geo-tz"],
  // The dynamic import of sweph is not statically traceable, so force its native
  // prebuild + ephe data into the serverless function bundle.
  outputFileTracingIncludes: {
    "/api/**": ["./node_modules/.pnpm/sweph@*/node_modules/sweph/**"],
  },
};

export default nextConfig;
