import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseOpenGroups, toGroups, withGroup } from './sidebar-groups.ts';
import type { TreeItem, TreeNode } from './tree.ts';

const page = (url: string, name = url): TreeItem => ({ type: 'page', name, url });

// The 2.x Documentation and User Guide tabs both open a "Sales" group.
const documentation: TreeNode[] = [
  page('/2.x/getting-started'),
  { type: 'separator', name: 'Sales' },
  page('/2.x/orders'),
  page('/2.x/customers'),
  {
    type: 'folder',
    name: 'Upgrade Guide',
    index: page('/2.x/upgrade'),
    children: [page('/2.x/upgrade'), page('/2.x/upgrade/v2-9-to-v2-10')],
  },
];
const userGuide: TreeNode[] = [{ type: 'separator', name: 'Sales' }, page('/2.x/user-guide/sales/orders')];

test('groups with the same title in two tabs get different ids', () => {
  const sales = (nodes: TreeNode[]) => toGroups(nodes).find((group) => group.title === 'Sales');
  assert.equal(sales(documentation)?.id, 'group:/2.x/orders');
  assert.equal(sales(userGuide)?.id, 'group:/2.x/user-guide/sales/orders');
});

test('the same tab gives the same ids on every render', () => {
  const ids = (nodes: TreeNode[]) => toGroups(nodes).map((group) => group.id);
  assert.deepEqual(ids(documentation), ['group:/2.x/getting-started', 'group:/2.x/orders', 'group:/2.x/upgrade']);
  assert.deepEqual(ids(structuredClone(documentation)), ids(documentation));
});

test('a top-level folder becomes a group led by its index, named Overview', () => {
  const upgrade = toGroups(documentation).at(-1);
  assert.equal(upgrade?.title, 'Upgrade Guide');
  assert.deepEqual(
    upgrade?.nodes.map((node) => node.type === 'page' && [node.name, node.url]),
    [
      ['Overview', '/2.x/upgrade'],
      ['/2.x/upgrade/v2-9-to-v2-10', '/2.x/upgrade/v2-9-to-v2-10'],
    ],
  );
});

test('withGroup adds an id once', () => {
  const open = withGroup([], 'group:/2.x/orders', true);
  assert.deepEqual(open, ['group:/2.x/orders']);
  assert.equal(withGroup(open, 'group:/2.x/orders', true), open);
});

test('withGroup removes an id on close', () => {
  assert.deepEqual(withGroup(['group:/2.x/orders', 'group:/2.x/upgrade'], 'group:/2.x/orders', false), [
    'group:/2.x/upgrade',
  ]);
});

test('withGroup returns the same array when nothing changes', () => {
  const groups = ['group:/2.x/orders'];
  assert.equal(withGroup(groups, 'group:/2.x/orders', true), groups);
  assert.equal(withGroup(groups, 'group:/2.x/upgrade', false), groups);
});

test('parseOpenGroups reads a stored list', () => {
  assert.deepEqual(parseOpenGroups('["group:/2.x/orders"]'), ['group:/2.x/orders']);
});

test('parseOpenGroups returns an empty list for nothing stored, invalid JSON and other values', () => {
  for (const raw of [null, '[', 'null', '{}']) {
    assert.deepEqual(parseOpenGroups(raw), [], String(raw));
  }
});
