/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  webpack: (config, { isServer }) => {
    // Exclude unused-template-files from webpack processing
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /unused-template-files/,
    });
    
    return config;
  },
  typescript: {
    // Ignore TypeScript errors in unused-template-files
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;