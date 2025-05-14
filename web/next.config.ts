import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // …any existing options…

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gh.jumia.is",   // Jumia CDN used in your data
        pathname: "/**",
      },
      // add more hosts here if you scrape other vendors
      // { protocol: "https", hostname: "*.supershop.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
