import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL;

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  devIndicators: false,
  eslint: { ignoreDuringBuilds: true },
  rewrites: async () => {
    // When BACKEND_URL is set (or in local dev), proxy /api/* to the standalone FastAPI server
    if (BACKEND_URL) {
      return [
        {
          source: "/api/:path*",
          destination: `${BACKEND_URL}/api/:path*`,
        },
      ];
    }
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: "http://127.0.0.1:8000/api/:path*",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
