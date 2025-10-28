/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@togetheros/ui'],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/bridge',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
