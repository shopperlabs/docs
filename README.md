## MCP server

The documentation runs an MCP server at `https://docs.shopperphp.com/mcp`. Its tools search the docs of one Shopper
version (`search`), list every page (`list_pages`) and return a page as Markdown (`get_page`).

Add it to Claude Code:

```bash
claude mcp add --transport http shopper-docs https://docs.shopperphp.com/mcp
```

In Cursor, add it to `.cursor/mcp.json`, or to `~/.cursor/mcp.json` for every project:

```json
{
  "mcpServers": {
    "shopper-docs": {
      "url": "https://docs.shopperphp.com/mcp"
    }
  }
}
```

The server lives in `app/mcp/route.ts`.

## Development

The documentation is a [Fumadocs](https://fumadocs.dev) site built on Next.js.

```bash
npm install
npm run dev
```

The local preview runs at `http://localhost:3000`.

Pages live in `content/docs/<version>` (`3.x`, `2.x`, `1.x`). Each folder's `meta.json` sets the sidebar order.
Legacy Mintlify URLs are redirected in `redirects.json`.

Before opening a pull request, run:

```bash
npm run types:check
npm run build
```
