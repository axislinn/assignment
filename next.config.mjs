/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: [
        'firebasestorage.googleapis.com',
        'lh3.googleusercontent.com',
        'example.com', // Replace with your actual domains
      ],
    },
    experimental: {
      optimizeCss: true,
    },
  }
  
  export default nextConfig
  