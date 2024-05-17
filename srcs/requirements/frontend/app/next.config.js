/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
      api42_authorize_url: process.env.API42_AUTHORIZE,
  }
}

module.exports = nextConfig
