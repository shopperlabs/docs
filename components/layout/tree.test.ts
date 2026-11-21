import assert from 'node:assert/strict';
import { globSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  activeTab,
  domainHref,
  scopeFor,
  tabsFor,
  upgradeGuide,
  versionHome,
  versionHref,
  versions,
  type TreeFolder,
  type TreeItem,
  type TreeNode,
  type TreeSeparator,
} from './tree.ts';

const page = (url: string): TreeItem => ({ type: 'page', name: url, url });
const separator = (name: string): TreeSeparator => ({ type: 'separator', name });
const folder = (name: string, children: TreeNode[], extra: Partial<TreeFolder> = {}): TreeFolder => ({
  type: 'folder',
  name,
  children,
  ...extra,
});
const tab = (name: string, children: TreeNode[]) => folder(name, children, { root: true });
const version = (id: string, children: TreeNode[]) => folder(id, children, { $id: id, root: 'version' });

// The shapes of content/docs: tabs are route groups (`(documentation)`), so their pages carry no tab segment.
const v3 = version('3.x', [
  tab('Documentation', [
    separator('Prologue'),
    page('/3.x/getting-started'),
    page('/3.x/whats-new'),
    separator('Core Concepts'),
    page('/3.x/models'),
    page('/3.x/pricing'),
    separator('Catalog'),
    folder('Products', [page('/3.x/products'), page('/3.x/product-variants')]),
    separator('Marketing'),
    separator('System'),
    page('/3.x/team'),
    page('/3.x/upgrade'),
  ]),
  tab('Storefront', [page('/3.x/storefront'), page('/3.x/store-api')]),
  tab('User Guide', [
    page('/3.x/user-guide'),
    folder('Catalog', [page('/3.x/user-guide/catalog/products')]),
    folder('Administration', [page('/3.x/user-guide/administration/team')]),
  ]),
]);
const v2 = version('2.x', [
  tab('Documentation', [
    separator('Prologue'),
    page('/2.x/getting-started'),
    page('/2.x/configuration'),
    page('/2.x/pricing'),
    page('/2.x/setup-store'),
    separator('Sales'),
    page('/2.x/orders'),
    folder('Upgrade Guide', [page('/2.x/upgrade/v2-9-to-v2-10')], { index: page('/2.x/upgrade') }),
  ]),
  tab('User Guide', [separator('Sales'), page('/2.x/user-guide/sales/orders')]),
]);
const v1 = version('1.x', [
  separator('Prologue'),
  page('/1.x/contributing'),
  separator('Getting Started'),
  page('/1.x/installation'),
  page('/1.x/models'),
]);
const tree = [v3, v2, v1];

test('versions lists the version folders in tree order', () => {
  assert.deepEqual(
    versions(tree).map((v) => v.$id),
    ['3.x', '2.x', '1.x'],
  );
});

test('versionHome is the landing page of a version that has one', () => {
  assert.equal(versionHome(v3), '/3.x');
});

test('versionHome is the first page of a version without a landing page', () => {
  assert.equal(versionHome(v2), '/2.x/getting-started');
  assert.equal(versionHome(v1), '/1.x/contributing');
});

test('no version link points at a redirect source, which Next prefetches in a loop', () => {
  const sources = new Set<string>(
    JSON.parse(readFileSync(new URL('../../redirects.json', import.meta.url), 'utf8')).map(
      (redirect: { source: string }) => redirect.source,
    ),
  );
  assert.ok(sources.has('/1.x') && sources.has('/2.x'));
  const links = versions(tree).flatMap((target) => [
    versionHome(target),
    ...tabsFor(target).map((entry) => entry.href),
    ...versions(tree).flatMap((current) => [
      versionHref(target, current, `/${current.$id}`),
      versionHref(target, current, `/${current.$id}/missing`),
    ]),
  ]);
  assert.deepEqual(
    links.filter((link) => sources.has(link)),
    [],
  );
});

test('no version switch from a page of content/docs lands on a redirect source', () => {
  const sources = new Set<string>(
    JSON.parse(readFileSync(new URL('../../redirects.json', import.meta.url), 'utf8')).map(
      (redirect: { source: string }) => redirect.source,
    ),
  );
  const urls = globSync('**/*.mdx', { cwd: new URL('../../content/docs', import.meta.url) }).map(
    (file) =>
      `/${file
        .replace(/\.mdx$/, '')
        .split('/')
        .filter((segment) => !/^\(.+\)$/.test(segment))
        .join('/')
        .replace(/\/index$/, '')}`,
  );
  const content = [...new Set(urls.map((url) => url.split('/')[1]))].map((id) =>
    version(id, urls.filter((url) => url.startsWith(`/${id}/`)).map(page)),
  );
  const switches = content.flatMap((current) =>
    current.children.flatMap((node) =>
      content.map((target) => versionHref(target, current, (node as TreeItem).url).split('#')[0]),
    ),
  );
  assert.deepEqual(
    switches.filter((link) => sources.has(link)),
    [],
  );
});

test('versionHref keeps the page when the target version has it', () => {
  assert.equal(versionHref(v2, v3, '/3.x/pricing'), '/2.x/pricing');
  assert.equal(versionHref(v3, v2, '/2.x/pricing'), '/3.x/pricing');
});

test('versionHref keeps the address in a version without the page, which answers 404', () => {
  assert.equal(versionHref(v1, v3, '/3.x/store-api'), '/1.x/store-api');
  assert.equal(versionHref(v3, v1, '/1.x/contributing'), '/3.x/contributing');
});

test('versionHref sends a page with an equivalent to the page that covers its topic', () => {
  assert.equal(versionHref(v2, v3, '/3.x/models'), '/2.x/configuration#models');
});

test('versionHref prefers the same page over an equivalent', () => {
  const v2WithModels = { ...v2, children: [...v2.children, page('/2.x/models')] };
  assert.equal(versionHref(v2WithModels, v3, '/3.x/models'), '/2.x/models');
});

test('versionHref sends a version root to the landing page of the target', () => {
  assert.equal(versionHref(v2, v3, '/3.x'), '/2.x/getting-started');
});

test('versionHref sends a page with neither a match nor an equivalent to its 404 in the target', () => {
  assert.equal(versionHref(v2, v3, '/3.x/store-api'), '/2.x/store-api');
});

test('versionHref reads no equivalent off the prototype for a path that is no page of the version', () => {
  assert.equal(versionHref(v2, v3, '/3.xconstructor'), '/2.x/getting-started');
});

test('tabsFor gives one tab per route group of 2.x and 3.x, opening on its first page', () => {
  assert.deepEqual(
    tabsFor(v3).map((entry) => [entry.name, entry.href]),
    [
      ['Documentation', '/3.x/getting-started'],
      ['Storefront', '/3.x/storefront'],
      ['User Guide', '/3.x/user-guide'],
    ],
  );
  assert.deepEqual(
    tabsFor(v2).map((entry) => [entry.name, entry.href]),
    [
      ['Documentation', '/2.x/getting-started'],
      ['User Guide', '/2.x/user-guide/sales/orders'],
    ],
  );
});

test('tabsFor gives the flat 1.x a single Documentation tab over the whole version', () => {
  const [only, ...rest] = tabsFor(v1);
  assert.deepEqual(rest, []);
  assert.equal(only.name, 'Documentation');
  assert.equal(only.href, '/1.x/contributing');
  assert.equal(only.folder, v1);
});

test('activeTab is the tab holding the page, inside a folder and on a folder index', () => {
  const tabs = tabsFor(v3);
  assert.equal(activeTab(tabs, '/3.x/user-guide/catalog/products').name, 'User Guide');
  assert.equal(activeTab(tabs, '/3.x/product-variants').name, 'Documentation');
  assert.equal(activeTab(tabsFor(v2), '/2.x/upgrade').name, 'Documentation');
});

test('activeTab falls back to the first tab on a page no tab holds', () => {
  assert.equal(activeTab(tabsFor(v3), '/3.x').name, 'Documentation');
});

test('scopeFor finds the version, the tab and the sidebar nodes of a page', () => {
  const scope = scopeFor(tree, '/3.x/store-api');
  assert.equal(scope.version, v3);
  assert.equal(scope.tab.name, 'Storefront');
  assert.equal(scope.nodes, scope.tab.folder.children);
  assert.equal(scope.home, false);
  assert.equal(scopeFor(tree, '/1.x/models').version, v1);
});

test('scopeFor marks only the version root as the landing page', () => {
  assert.equal(scopeFor(tree, '/3.x').home, true);
  assert.equal(scopeFor(tree, '/3.x/getting-started').home, false);
  assert.equal(scopeFor(tree, '/3.xfoo').home, false);
});

test('scopeFor puts a path outside every version in the first version', () => {
  assert.equal(scopeFor(tree, '/missing').version, v3);
  assert.equal(scopeFor(tree, '/2.xfoo').version, v3);
});

const documentation = (v: TreeFolder) => tabsFor(v)[0].folder;
const userGuide = tabsFor(v3)[2].folder;

test('domainHref opens a section that starts on a folder on the folder first page', () => {
  assert.equal(domainHref(documentation(v3), 'Catalog'), '/3.x/products');
});

test('domainHref stops an empty section at the next separator and opens the tab overview', () => {
  assert.equal(domainHref(documentation(v3), 'Marketing'), '/3.x/getting-started');
});

test('domainHref opens a section that starts on a page on that page', () => {
  assert.equal(domainHref(documentation(v3), 'System'), '/3.x/team');
});

test('domainHref opens the tab overview for a missing domain', () => {
  assert.equal(domainHref(documentation(v3), 'Sales'), '/3.x/getting-started');
});

test('domainHref opens a User Guide folder of that name', () => {
  assert.equal(domainHref(userGuide, 'Administration'), '/3.x/user-guide/administration/team');
});

test('upgradeGuide gives a 3.x page the 3.x guide', () => {
  assert.equal(upgradeGuide(tree, '/3.x/store-api'), '/3.x/upgrade');
});

test('upgradeGuide gives a 2.x page the 2.x guide, a folder index', () => {
  assert.equal(upgradeGuide(tree, '/2.x/pricing'), '/2.x/upgrade');
});

test('upgradeGuide gives a 1.x page and a path outside any version the first version guide', () => {
  assert.equal(upgradeGuide(tree, '/1.x/installation'), '/3.x/upgrade');
  assert.equal(upgradeGuide(tree, '/missing'), '/3.x/upgrade');
});

test('upgradeGuide does not read /2.xfoo as 2.x', () => {
  assert.equal(upgradeGuide(tree, '/2.xfoo'), '/3.x/upgrade');
});

test('upgradeGuide never links a redirect source', () => {
  const sources = new Set<string>(
    JSON.parse(readFileSync(new URL('../../redirects.json', import.meta.url), 'utf8')).map(
      (redirect: { source: string }) => redirect.source,
    ),
  );
  for (const pathname of ['/3.x', '/3.x/models', '/2.x/pricing', '/1.x/models', '/', '/missing']) {
    assert.equal(sources.has(upgradeGuide(tree, pathname)), false, pathname);
  }
});
