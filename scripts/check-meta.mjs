import { existsSync, globSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const root = process.argv[2] ?? '.';
const docs = join(root, 'content/docs');

// 2.x pages kept reachable by URL for old links, deliberately left out of the 2.x sidebar.
const unlisted = new Set([
  '2.x/(extending)/extending/empty-state.mdx',
  '2.x/(extending)/extending/forms.mdx',
  '2.x/(extending)/extending/modals.mdx',
  '2.x/(extending)/extending/slideover.mdx',
]);

const pageUrl = (file) => {
  const segments = file
    .replace(/\.mdx?$/, '')
    .split('/')
    .filter((segment) => !/^\(.+\)$/.test(segment));
  if (segments.at(-1) === 'index') segments.pop();
  return `/${segments.join('/')}`;
};

const files = globSync('**/*.mdx', { cwd: docs });
const problems = [];

for (const meta of globSync('**/meta.json', { cwd: docs })) {
  const { pages } = JSON.parse(readFileSync(join(docs, meta), 'utf8'));
  if (!pages) continue;
  const dir = dirname(meta) === '.' ? '' : dirname(meta);
  const entries = pages.filter((entry) => !/^---.*---$/.test(entry) && !/^\[.*\]\(.*\)$/.test(entry));
  const rest = entries.some((entry) => entry === '...' || entry === 'z...a');

  const named = entries.filter((entry) => entry !== '...' && entry !== 'z...a');
  for (const entry of named) {
    const path = join(docs, dir, entry);
    const found = existsSync(`${path}.mdx`) || (existsSync(path) && statSync(path).isDirectory());
    if (!found) problems.push(`content/docs/${meta}: "${entry}" names no page or folder`);
  }
  if (rest) continue;

  for (const file of files) {
    if (dir && !file.startsWith(`${dir}/`)) continue;
    const inside = relative(dir, file).replace(/\.mdx$/, '');
    if (inside === 'index' || unlisted.has(file)) continue;
    if (!named.some((entry) => inside === entry || inside.startsWith(`${entry}/`))) {
      problems.push(`content/docs/${file}: not listed in content/docs/${meta}`);
    }
  }
}

const pageUrls = new Set([...files.map(pageUrl), '/3.x']);
const redirects = JSON.parse(readFileSync(join(root, 'redirects.json'), 'utf8'));
for (const { source, destination } of redirects) {
  if (destination.includes(':')) continue;
  if (!pageUrls.has(destination)) problems.push(`redirects.json: ${source} goes to ${destination}, which is no page`);
}

if (problems.length) {
  console.error(`${problems.length} sidebar problems:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`ok: ${files.length} pages listed in their meta.json, ${redirects.length} redirects land on a page`);
