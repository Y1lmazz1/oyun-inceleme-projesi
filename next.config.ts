import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'shared.fastly.steamstatic.com', // Steam
      },
      {
        protocol: 'https',
        hostname: 'storage.oyungezer.com.tr', // Oyungezer
      },
      {
        protocol: 'https',
        hostname: 'tr.pinterest.com', // Pinterest
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Kendi Supabase Depolaman
      },
    ],
  },
};

export default nextConfig;