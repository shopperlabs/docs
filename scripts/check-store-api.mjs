import { globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? '.';
const docs = join(root, 'content/docs/3.x');
const routes = 'https://raw.githubusercontent.com/shopperlabs/shopper/3.x/packages/api/routes';

// Default of the `shopper.http.prefix` config: the store, authenticated and webhook groups all sit under it.
const prefix = '/store';

const download = async (file) => {
  const response = await fetch(`${routes}/${file}`);
  if (!response.ok) throw new Error(`${routes}/${file}: HTTP ${response.status}`);
  return response.text();
};

// A client never sees route parameter names, and the docs name them for the reader ({addressId} for {address}).
const key = (method, path) => `${method} ${path.replace(/\{[^}]+\}/g, '{}')}`;

const problems = [];
const shopper = new Map();
const files = [...(await download('store.php')).matchAll(/require __DIR__\.'\/(store\/[\w-]+\.php)'/g)].map(
  (match) => match[1],
);

for (const file of files) {
  const groups = [];
  for (const line of (await download(file)).split('\n')) {
    const route = line.match(/Route::(get|post|put|patch|delete)\('([^']*)'/);
    if (route) {
      const path = [prefix, ...groups, route[2]].join('/').replace(/\/+/g, '/').replace(/(.)\/$/, '$1');
      shopper.set(key(route[1].toUpperCase(), path), `${route[1].toUpperCase()} ${path} (${file})`);
    } else if (line.includes('->group(function')) {
      groups.push(line.match(/Route::prefix\('([^']*)'\)/)?.[1] ?? '');
    } else if (/^\s*}\);/.test(line)) {
      groups.pop();
    } else if (line.includes('Route::')) {
      problems.push(`${file}: route line not understood by this check: ${line.trim()}`);
    }
  }
}

// <Endpoint> is the block that documents a route, <Route> its row in the route list at the top of the page.
const documented = { Endpoint: new Map(), Route: new Map() };
for (const page of globSync('**/*.mdx', { cwd: docs })) {
  for (const [tag, kind] of readFileSync(join(docs, page), 'utf8').matchAll(/<(Endpoint|Route)\b[^>]*>/g)) {
    const method = tag.match(/\bmethod="([A-Z]+)"/)?.[1];
    const path = tag.match(/\bpath="([^"]+)"/)?.[1];
    documented[kind].set(key(method, path), `${method} ${path} (content/docs/3.x/${page})`);
  }
}

for (const [kind, tags] of Object.entries(documented)) {
  for (const [route, label] of shopper) {
    if (!tags.has(route)) problems.push(`no <${kind}> for ${label}`);
  }
  for (const [route, label] of tags) {
    if (!shopper.has(route)) problems.push(`<${kind}> ${label} matches no route of shopper 3.x`);
  }
}

if (problems.length) {
  console.error(`${problems.length} Store API problems:\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`ok: the ${shopper.size} Store API routes of shopper 3.x each have an <Endpoint> block and a <Route> row`);
