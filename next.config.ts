import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async rewrites() {
    return {
      // Subdominio por negocio: nova-studio.appflu.es → portal de "nova-studio".
      // Se resuelve en el enrutador, sin ejecutar código ni tocar la base de datos.
      beforeFiles: [
        {
          source: '/',
          has: [{ type: 'host', value: '(?<slug>(?!www\\.)[a-z0-9-]+)\\.appflu\\.es' }],
          destination: '/p/:slug',
        },
      ],
      // La web estática de siempre vive en /public; la portada sigue siendo index.html.
      afterFiles: [{ source: '/', destination: '/index.html' }],
      fallback: [],
    }
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
