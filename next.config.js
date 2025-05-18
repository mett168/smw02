// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // ✅ 빌드 시 ESLint 오류 무시하고 통과시킴
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

