import { createMDX } from 'fumadocs-mdx/next';
import redirects from './redirects.json' with { type: 'json' };

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  experimental: {
    agentUpgrade: 'security',
  },
  // Screenshots change only with a deploy, and every re-encode on Vercel is billed: 31 days instead of Next's 4 hours.
  images: {
    minimumCacheTTL: 2678400,
  },
  async redirects() {
    return redirects;
  },
};

export default withMDX(config);
