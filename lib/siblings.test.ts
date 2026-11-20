import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { TreeFolder, TreeItem, TreeNode } from '../components/layout/tree.ts';
import { pageSiblings } from './siblings.ts';

const page = (url: string): TreeItem => ({ type: 'page', name: url, url });
const folder = (name: string, children: TreeNode[], extra: Partial<TreeFolder> = {}): TreeFolder => ({
  type: 'folder',
  name,
  children,
  ...extra,
});

const tree = [
  folder(
    '3.x',
    [
      folder('Documentation', [page('/3.x/getting-started'), folder('Catalog', [page('/3.x/products')])], {
        root: true,
      }),
      folder('Storefront', [page('/3.x/storefront'), page('/3.x/store-api')], { root: true }),
      folder('User Guide', [page('/3.x/user-guide')], { root: true }),
    ],
    { $id: '3.x', root: 'version' },
  ),
  folder('1.x', [page('/1.x/contributing'), page('/1.x/installation')], { $id: '1.x', root: 'version' }),
];
const descriptions: Record<string, string> = { '/3.x/storefront': 'Starter kits and the Store API.' };
const siblings = (url: string) => pageSiblings(tree, url, (href) => descriptions[href]);

test('a page links the page before it in its section', () => {
  assert.deepEqual(siblings('/3.x/store-api').prev, { url: '/3.x/storefront', name: '/3.x/storefront' });
});

test('the last page of a section opens the next section with its description', () => {
  assert.deepEqual(siblings('/3.x/products').next, {
    url: '/3.x/storefront',
    name: 'Storefront',
    section: { description: 'Starter kits and the Store API.' },
  });
});

test('the first page of a section goes back to the section before it', () => {
  assert.deepEqual(siblings('/3.x/storefront').prev, {
    url: '/3.x/getting-started',
    name: 'Documentation',
    section: { description: undefined },
  });
});

test('pages inside a folder follow each other', () => {
  assert.deepEqual(siblings('/3.x/getting-started').next, { url: '/3.x/products', name: '/3.x/products' });
});

test('the first page of a version has no previous page', () => {
  assert.equal(siblings('/3.x/getting-started').prev, undefined);
  assert.equal(siblings('/1.x/contributing').prev, undefined);
});

test('the last page of a version has no next page', () => {
  assert.equal(siblings('/3.x/user-guide').next, undefined);
  assert.equal(siblings('/1.x/installation').next, undefined);
});

test('a flat version walks its pages without a section link', () => {
  assert.deepEqual(siblings('/1.x/contributing').next, { url: '/1.x/installation', name: '/1.x/installation' });
});

test('a path that is no page of the sidebar has no siblings', () => {
  assert.deepEqual(siblings('/3.x'), {});
});
