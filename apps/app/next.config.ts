import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@local-sql/ui"],
  output: "standalone",
};

export default nextConfig;
