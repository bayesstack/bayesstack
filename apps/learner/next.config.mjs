/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/learner",
  transpilePackages: [
    "@bayesstack/assets",
    "@bayesstack/ui",
    "@bayesstack/tenant",
    "@bayesstack/studio-video",
    "@bayesstack/studio-coding",
  ],
};

export default nextConfig;

