import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep native deps out of the Server Components bundle so they're loaded via
  // require and traced correctly into the serverless function:
  //   • impit — Rust native addon (browser-impersonating fetch, ./lib/news/http).
  // Article extraction uses linkedom (pure JS), which bundles normally.
  serverExternalPackages: ["impit"],
};

export default nextConfig;
