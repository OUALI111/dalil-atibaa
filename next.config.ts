import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // إزالة .html
      {
        source: '/:path*.html',
        destination: '/:path*',
        permanent: true,
      },
      // إزالة .php
      {
        source: '/:path*.php',
        destination: '/:path*',
        permanent: true,
      },
      // index.html
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      // index.php
      {
        source: '/index.php',
        destination: '/',
        permanent: true,
      },
      // recherche/index.html
      {
        source: '/recherche/index.html',
        destination: '/recherche',
        permanent: true,
      },
    ]
  },
}

export default nextConfig;