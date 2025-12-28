import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  serverExternalPackages: ['pg', '@prisma/adapter-pg'],
};

export default nextConfig;
