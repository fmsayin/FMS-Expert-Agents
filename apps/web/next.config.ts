import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@fms/shared",
    "@fms/db",
    "@fms/orchestrator",
    "@fms/agents",
  ],
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
};

export default nextConfig;
