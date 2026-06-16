import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep native/Node-only deps out of the Server Components bundle so they're
  // loaded via require and traced correctly into the serverless function:
  //   • jsdom  — dynamic requires and Node built-ins (article extraction).
  //   • impit  — Rust native addon (browser-impersonating fetch, ./lib/news/http).
  serverExternalPackages: ["jsdom", "impit"],
};

export default nextConfig;
