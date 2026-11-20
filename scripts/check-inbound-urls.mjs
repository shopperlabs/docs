import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? '.';

const pageUrl = (file) => {
  const segments = file
    .replace(/\.mdx?$/, '')
    .split('/')
    .filter((segment) => !/^\(.+\)$/.test(segment));
  if (segments.at(-1) === 'index') segments.pop();
  return `/${segments.join('/')}`;
};

// Pages served by app/ rather than by content.
const served = new Set(['/3.x', '/llms.txt', '/llms-full.txt']);
for (const file of globSync('**/*.mdx', { cwd: join(root, 'content/docs') })) served.add(pageUrl(file));
for (const { source } of JSON.parse(readFileSync(join(root, 'redirects.json'), 'utf8'))) served.add(source);

const inbound = JSON.parse(readFileSync(join(root, 'inbound-urls.json'), 'utf8'));
const missing = Object.entries(inbound).filter(([path]) => !served.has(path));

if (missing.length) {
  console.error(
    `${missing.length} laravelshopper.dev links land on no page and no redirect:\n` +
      missing.map(([path, from]) => `${path} (linked from ${from})`).join('\n'),
  );
  process.exit(1);
}
console.log(`ok: ${Object.keys(inbound).length} laravelshopper.dev links land on a page or a redirect`);
