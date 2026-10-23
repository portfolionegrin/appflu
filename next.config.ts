import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // La web estática de siempre vive en /public; la portada sigue siendo index.html.
  async rewrites() {
    return [{ source: '/', destination: '/index.html' }]
  },
  async headers() {
    return [
      {
        source: '/p/:slug*',
        headers: [
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Robots-Tag', value: 'noindex' },
        ],
      },
    ]
  },
}

export default nextConfig
