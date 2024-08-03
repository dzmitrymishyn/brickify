import analyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = analyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withBundleAnalyzer(nextConfig);
