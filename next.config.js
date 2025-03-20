/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'sql.js-httpvfs': 'sql.js-httpvfs/dist/index',
    }
    return config
  },
  experimental: {
    serverActions: true,
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig 