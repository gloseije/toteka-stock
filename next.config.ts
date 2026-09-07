import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "upload.wikimedia.org",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "9000",
                pathname: "/**",
            },
            {
                protocol: "http",
                hostname: "127.0.0.1",
                port: "9000",
                pathname: "/**",
            },
            // Cloudflare R2 (domaine direct : <accountId>.r2.cloudflarestorage.com)
            {
                protocol: "https",
                hostname: "*.r2.cloudflarestorage.com",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
