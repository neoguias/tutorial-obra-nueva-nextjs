import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    // Las Server Actions aceptan 1 MB por defecto. Subimos hasta 6 fotos de 5 MB a la vez.
    serverActions: { bodySizeLimit: '32mb' },
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
