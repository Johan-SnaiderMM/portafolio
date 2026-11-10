import type { NextConfig } from "next";

/** Modelos y WebAssembly del laboratorio: pesan varios MB y solo cambian con un despliegue nuevo. */
const longCache = [
  {
    key: "Cache-Control",
    value: "public, max-age=86400, stale-while-revalidate=604800",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/lab/:path*", headers: longCache },
    ];
  },
  /* config options here */
  cacheComponents: true,
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
