import { createMDX } from 'fumadocs-mdx/next';
import redirects from './redirects.json' with { type: 'json' };

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    agentUpgrade: 'security',
  },
  async redirects() {
    return redirects;
  },
};

export default withMDX(config);
