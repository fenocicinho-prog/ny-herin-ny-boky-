import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "uploadthing.com" },
      { protocol: "https", hostname: "uploadthing-prod.s3.us-west-2.amazonaws.com" },
    ],
  },
};

export default nextConfig;
