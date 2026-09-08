/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/faculty",
  transpilePackages: ["@bayesstack/assets", "@bayesstack/ui", "@bayesstack/tenant"],
};

export default nextConfig;

