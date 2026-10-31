import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'Shopper';
export const docsRoute = '/';
export const docsImageRoute = '/og';
export const docsContentRoute = '/llms.mdx';

export const gitConfig = {
  user: 'shopperlabs',
  repo: 'docs',
  branch: '3.x',
};

export const shopperRepo = {
  owner: 'shopperlabs',
  repo: 'shopper',
};

export const links = {
  github: 'https://github.com/shopperlabs/shopper',
  releases: 'https://github.com/shopperlabs/shopper/releases',
  discussions: 'https://github.com/shopperlabs/shopper/discussions',
  demo: 'https://demo.laravelshopper.dev',
  blog: 'https://laravelshopper.dev/blog',
  discord: 'https://discord.gg/r4VUvHm34',
  x: 'https://x.com/laravelshopper',
};

const getContentUrl =createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
