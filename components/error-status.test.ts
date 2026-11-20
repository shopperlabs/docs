import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Children, createElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { badgeErrorStatuses } from './error-status.ts';

type Parent = ReactElement<{ children?: ReactNode; className?: string }>;

// MDX puts a newline between the table parts, so the fixture does too.
const table = (headings: string[], ...rows: string[][]) => [
  createElement('thead', null, createElement('tr', null, ...headings.map((heading) => createElement('th', null, heading)))),
  '\n',
  createElement(
    'tbody',
    null,
    ...rows.map((cells) => createElement('tr', null, ...cells.map((cell) => createElement('td', null, cell)))),
  ),
];

const elementsOf = (children: ReactNode) =>
  Children.toArray(children).filter((child): child is Parent => isValidElement(child));

const cellsOf = (rendered: ReactNode) =>
  elementsOf(rendered)
    .slice(1)
    .flatMap((body) => elementsOf(body.props.children))
    .map((row) =>
      elementsOf(row.props.children).map((cell) => {
        const [badge] = elementsOf(cell.props.children);

        return badge ? `[${badge.props.className}:${badge.props.children}]` : cell.props.children;
      }),
    );

test('badges the 4xx and 5xx cells of the Status column only', () => {
  const rendered = badgeErrorStatuses(
    table(['Code', 'Status', 'When'], ['bad_request', '400', 'An include outside the allowlist'], ['422', '503', 'The carrier is failing']),
    'red',
  );

  assert.deepEqual(cellsOf(rendered), [
    ['bad_request', '[red:400]', 'An include outside the allowlist'],
    ['422', '[red:503]', 'The carrier is failing'],
  ]);
});

test('leaves a Status column of names untouched', () => {
  const rendered = badgeErrorStatuses(table(['Status', 'When'], ['Draft', 'The discount is not saved yet'], ['200', 'OK']), 'red');

  assert.deepEqual(cellsOf(rendered), [
    ['Draft', 'The discount is not saved yet'],
    ['200', 'OK'],
  ]);
});

test('returns a table without a Status column as it came', () => {
  const children = table(['Discount', 'Hoodie line'], ['TSHIRT10', '500']);

  assert.equal(badgeErrorStatuses(children, 'red'), children);
});
