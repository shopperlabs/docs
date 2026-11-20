import { readFileSync, globSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? '.';
const sources = JSON.parse(readFileSync(join(root, 'redirects.json'), 'utf8')).map((r) => r.source);
// `/` redirects once and stops; only redirects that are not a 307 chain to a page loop (T2).
const exact = new Set(sources.filter((s) => !s.includes(':') && s !== '/'));
const prefixes = sources.filter((s) => s.endsWith('/:path*')).map((s) => s.slice(0, -':path*'.length));

const href = /href(?:=|:\s*)\{?\s*['"`](\/[^'"`$]*)['"`]|\]\((\/[^)\s]*)\)/g;
const bad = [];
for (const file of globSync(['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'content/**/*.mdx'], { cwd: root })) {
  const text = readFileSync(join(root, file), 'utf8');
  for (const m of text.matchAll(href)) {
    const url = (m[1] ?? m[2]).split(/[?#]/)[0].replace(/\/$/, '') || '/';
    if (exact.has(url) || prefixes.some((p) => url.startsWith(p))) bad.push(`${file}: ${url}`);
  }
}
if (bad.length) {
  console.error(`Links to a redirect (Next prefetches them in a loop):\n${bad.join('\n')}`);
  process.exit(1);
}
console.log(`ok: no literal link to any of ${exact.size + prefixes.length} redirect sources`);
