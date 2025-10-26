/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Force disable caching during development
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
}

module.exports = nextConfig
