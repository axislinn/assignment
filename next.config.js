/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'wqgckmwwgtvktnaegkgc.supabase.co', // Your Supabase project domain
      'localhost',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig 