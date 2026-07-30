/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  experimental: {
    serverActions: { // 👈 Changed from serverAction (singular) to serverActions (plural)
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;