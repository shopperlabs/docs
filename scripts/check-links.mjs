import { existsSync, globSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import GithubSlugger from 'github-slugger';

const root = process.argv[2] ?? '.';
const docs = join(root, 'content/docs');

// Pages served by app/ rather than by content.
const routes = new Set(['/3.x', '/llms.txt', '/llms-full.txt']);

function pageUrl(file) {
  const segments = file
    .replace(/\.mdx?$/, '')
    .split('/')
    .filter((segment) => !/^\(.+\)$/.test(segment));
  if (segments.at(-1) === 'index') segments.pop();
  return `/${segments.join('/')}`;
}

// Fenced blocks and inline code are text, not links or headings.
function prose(text) {
  let fenced = false;
  return text.split('\n').map((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      return '';
    }
    return fenced ? '' : line.replace(/``.*?``|`[^`]*`/g, '');
  });
}

// The ids fumadocs' remark-heading gives: a `[#id]` pin, else github-slugger over the heading text, one slugger per page.
function anchorsOf(lines, raw) {
  const slugger = new GithubSlugger();
  const ids = new Set();
  let fenced = false;
  for (const line of raw.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    if (fenced) continue;
    const heading = line.match(/^#{1,6}\s+(.*?)\s*#*\s*$/);
    if (!heading) continue;
    const pin = heading[1].match(/\s*\[#([^\]]+)\]\s*$/);
    if (pin) {
      ids.add(pin[1]);
      continue;
    }
    const text = heading[1]
      .replace(/`([^`]*)`/g, '$1')
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/(\*\*|__|\*|_)(.*?)\1/g, '$2');
    ids.add(slugger.slug(text.trim()));
  }
  for (const line of lines) for (const [, id] of line.matchAll(/\bid=["']([^"']+)["']/g)) ids.add(id);
  return ids;
}

const pages = new Map();
for (const file of globSync('**/*.mdx', { cwd: docs })) {
  const raw = readFileSync(join(docs, file), 'utf8');
  const lines = prose(raw);
  pages.set(pageUrl(file), { file: `content/docs/${file}`, lines, anchors: anchorsOf(lines, raw) });
}

const link = /\]\(\s*([/#][^)\s]*)|\bhref=\{?\s*["'`]([/#][^"'`]*)["'`]|^\s*\[[^\]]+\]:\s*([/#]\S*)/g;
const problems = [];
let checked = 0;
for (const page of pages.values()) {
  page.lines.forEach((line, at) => {
    for (const match of line.matchAll(link)) {
      const target = match[1] ?? match[2] ?? match[3];
      const [path, anchor] = target.split('#');
      const where = `${page.file}:${at + 1}: ${target}`;
      checked++;
      const linked = path === '' ? page : pages.get(path.replace(/\/$/, '') || '/');
      if (!linked) {
        const file = join(root, 'public', decodeURIComponent(path));
        const served = routes.has(path) || (existsSync(file) && statSync(file).isFile());
        if (!served) problems.push(`${where} (no page)`);
        else if (anchor && !routes.has(path)) problems.push(`${where} (anchor on a file)`);
        continue;
      }
      if (anchor !== undefined && !linked.anchors.has(anchor)) problems.push(`${where} (no heading #${anchor} on ${path || 'this page'})`);
    }
  });
}

if (problems.length) {
  console.error(`${problems.length} broken links:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`ok: ${checked} internal links in ${pages.size} pages resolve`);
