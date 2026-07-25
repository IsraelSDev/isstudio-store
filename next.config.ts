import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Evita o Turbopack inferir o root errado (vários package.json no Desktop)
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
