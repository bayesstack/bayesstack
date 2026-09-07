/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@bayesstack/assets",
    "@bayesstack/ui",
    "@bayesstack/tenant",
    "@bayesstack/studio-video",
    "@bayesstack/studio-coding",
  ],
};

export default nextConfig;
