import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // jsdom (used by the article reader's server-side extraction) relies on
  // dynamic requires and Node built-ins; keep it external rather than bundling.
  serverExternalPackages: ["jsdom"],
};

export default nextConfig;
