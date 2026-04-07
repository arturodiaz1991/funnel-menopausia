import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  typescript: {
    // Temporarily ignore build errors to diagnose Vercel deployment issue
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
