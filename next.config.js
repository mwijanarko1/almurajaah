/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'replicate.delivery', // If using Replicate
      'firebasestorage.googleapis.com' // If using Firebase Storage
    ]
  }
}

module.exports = nextConfig 