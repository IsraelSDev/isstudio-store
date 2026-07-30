import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Evita o Turbopack inferir o root errado (vários package.json no Desktop)
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  // Garante que os kits versionados em content/kits vão no bundle serverless
  // (senão o download em produção não encontra os arquivos).
  outputFileTracingIncludes: {
    "/api/downloads/[productId]": ["./content/kits/**/*"],
  },
};

export default nextConfig;
