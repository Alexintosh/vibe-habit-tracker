/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the SQLite WASM files to be loaded from the node_modules directory
  async rewrites() {
    return [
      {
        source: '/sqlite-wasm/:path*',
        destination: '/api/sqlite-wasm/:path*',
      },
    ]
  },
  
  // Add security headers for WebAssembly
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
      {
        source: '/sqlite-wasm/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
        ],
      },
      {
        source: '/sqlite-wasm/:path*.wasm',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/wasm',
          },
        ],
      },
    ]
  },
  
  webpack: (config) => {
    // Add support for WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }
    
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