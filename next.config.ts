import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Supabase Storage에 업로드한 이미지를 next/image로 최적화해서 보여주기 위한 설정.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
