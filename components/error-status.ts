import { Children, cloneElement, createElement, isValidElement, type ReactElement, type ReactNode } from 'react';

type Parent = ReactElement<{ children?: ReactNode }>;

const elementsOf = (children: ReactNode) =>
  Children.toArray(children).filter((child): child is Parent => isValidElement(child));

// Only the column headed "Status" is read: other columns hold amounts and counts, such as 500 cents.
export function badgeErrorStatuses(children: ReactNode, className: string): ReactNode {
  const [head, ...bodies] = elementsOf(children);
  const headings = elementsOf(elementsOf(head?.props.children)[0]?.props.children);
  const column = headings.findIndex((heading) => heading.props.children === 'Status');

  if (column === -1) {
    return children;
  }

  return [
    head,
    ...bodies.map((body) =>
      cloneElement(
        body,
        undefined,
        elementsOf(body.props.children).map((row) =>
          cloneElement(
            row,
            undefined,
            elementsOf(row.props.children).map((cell, index) => {
              const value = cell.props.children;

              return index === column && typeof value === 'string' && /^[45]\d\d$/.test(value)
                ? cloneElement(cell, undefined, createElement('span', { className }, value))
                : cell;
            }),
          ),
        ),
      ),
    ),
  ];
}
