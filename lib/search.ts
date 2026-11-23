import { createFromSource } from 'fumadocs-core/search/server';
import { source } from '@/lib/source';

export const searchServer = createFromSource(source, {
  buildIndex(page) {
    return {
      id: page.url,
      url: page.url,
      title: page.data.title,
      description: page.data.description,
      structuredData: page.data.structuredData,
      tag: page.slugs[0],
    };
  },
});
