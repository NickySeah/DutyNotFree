import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  transpilePackages: ["msw", "@mswjs/interceptors", "until-async"],
  // outputFileTracingRoot: '/Users/nogamesense2/DutyNotFree/my-app',

  // Add this rewrites function
  async rewrites() {
    if (!process.env.BACKEND_API_URL) return [];
    return [
      {
        // This is the "public" path your browser will call
        source: "/api/v1/:path*",

        // This is the "private" destination that Vercel will call
        destination: `${process.env.BACKEND_API_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
