import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Apenas os IPs e hostnames, sem as portas
  allowedDevOrigins: [
    '172.22.176.1', 
    'localhost', 
    '127.0.0.1', 
    '10.1.50.3'
  ],
};

export default nextConfig;