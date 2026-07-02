import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Workspace-Root fest auf dieses Projekt pinnen. Sonst erkennt Turbopack durch
  // ein verirrtes package-lock.json im Home-Verzeichnis den falschen Root und
  // zerschießt die .next/dev-Manifeste (ENOENT build-manifest.json → HTTP 500).
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
