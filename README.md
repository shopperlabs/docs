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
