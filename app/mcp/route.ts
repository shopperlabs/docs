import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { registerSourceTools } from 'fumadocs-core/mcp';
import { z } from 'zod';
import { versions } from '@/components/layout/tree';
import { searchServer } from '@/lib/search';
import { docsLlms, getDocsTree, source } from '@/lib/source';

const docsVersions = versions(getDocsTree());
const [current, ...older] = docsVersions.map((version) => version.$id!);

function server() {
  const mcp = new McpServer({ name: 'shopper-docs', title: 'Shopper documentation', version: '1.0.0' });

  // Fumadocs' own search tool has no version filter, and every page exists once per version.
  mcp.registerTool(
    'search',
    {
      title: 'Search the Shopper documentation',
      description: 'Search the Shopper documentation. Returns the matching pages and sections with their URLs; read a page with get_page.',
      inputSchema: z.object({
        query: z.string(),
        version: z
          .enum([current, ...older])
          .default(current)
          .describe(
            `Shopper version: ${docsVersions.map((version) => `${version.$id} (${version.description})`).join(', ')}. Use the version of shopper/framework the project requires.`,
          ),
      }),
    },
    async ({ query, version }) => ({
      content: [{ type: 'text', text: JSON.stringify(await searchServer.search(query, { tag: version })) }],
    }),
  );

  registerSourceTools(mcp, source, docsLlms);

  return mcp;
}

const handler = createMcpHandler(server);

export function POST(request: Request) {
  return handler.fetch(request);
}
