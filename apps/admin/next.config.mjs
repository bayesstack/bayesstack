/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/admin",
  transpilePackages: ["@bayesstack/assets", "@bayesstack/ui", "@bayesstack/tenant"],
};

export default nextConfig;

