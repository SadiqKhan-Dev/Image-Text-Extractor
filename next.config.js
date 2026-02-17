/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16+ uses Turbopack by default.
  // Tesseract.js is dynamically imported only on the client side,
  // so no special bundler configuration is required.
  turbopack: {},
};

module.exports = nextConfig;
