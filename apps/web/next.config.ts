import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  async redirects() {
    return [
      { source: "/research", destination: "/outputs", permanent: true },
      { source: "/dashboard", destination: "/", permanent: false },
      { source: "/reports", destination: "/outputs", permanent: false },
      { source: "/sign-in", destination: "/login", permanent: false },
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
