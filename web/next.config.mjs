/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // allow the seed images from picsum
  images: { remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }] },
};
export default nextConfig;
