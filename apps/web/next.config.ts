import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/research", destination: "/outputs", permanent: true },
      { source: "/dashboard", destination: "/", permanent: false },
    ];
  },
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
