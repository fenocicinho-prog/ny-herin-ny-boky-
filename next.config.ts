import type { NextConfig } from "next";

module.exports = {
  allowedDevOrigins: ['192.168.1.118'],
}

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
