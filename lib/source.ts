import { llms, loader, type LoaderPlugin } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';
import type { TreeItem, TreeNode } from '@/components/layout/tree';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema.extend({
      sidebarTitle: z.string().optional(),
    }),
    lastModified: true,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

const sidebarTitlePlugin: LoaderPlugin = {
  transformPageTree: {
    file(node, filePath) {
      const file = filePath ? this.storage.read(filePath) : undefined;
      const sidebarTitle = file?.format === 'page' && 'sidebarTitle' in file.data ? file.data.sidebarTitle : undefined;

      return typeof sidebarTitle === 'string' ? { ...node, name: sidebarTitle } : node;
    },
  },
};

export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin(), sidebarTitlePlugin],
});

/**
 * The page tree the shell renders. `pagesIndex` in `2.x/meta.json` gives the
 * version folder an index that is no page (its `$id` is not a file), and
 * folders emptied by the filter are dropped. Pages keep only what the shell
 * renders, since every page of every version goes to the client.
 */
export function getDocsTree(): TreeNode[] {
  return clean(source.getPageTree().children as unknown as TreeNode[]);
}

function clean(nodes: TreeNode[]): TreeNode[] {
  return nodes
    .map((node) => {
      if (node.type === 'page') return item(node);
      if (node.type !== 'folder') return node;
      const index = node.index?.$id?.endsWith('.mdx') ? item(node.index) : undefined;
      return { ...node, index, children: clean(node.children) };
    })
    .filter((node) => node.type !== 'folder' || node.children.length > 0 || node.index !== undefined);
}

function item({ $id, type, name, url, external }: TreeItem): TreeItem {
  return { $id, type, name, url, external };
}

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
});
