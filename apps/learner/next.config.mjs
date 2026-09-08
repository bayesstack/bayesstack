/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/learner",
  transpilePackages: ["@bayesstack/assets", "@bayesstack/ui", "@bayesstack/tenant"],
};

export default nextConfig;

