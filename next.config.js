/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Prevent bundling native Node backend for transformers
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['onnxruntime-node'] = false;
    return config;
  },
};

module.exports = nextConfig;
