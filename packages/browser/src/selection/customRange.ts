import { flow } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';

import { fromRangeLike } from './rangeLike';

export type CustomRange = {
  startPath: number[];
  endPath: number[];
  container: Node;
};

const getPath = (container: Node, node: Node, offset: number) => {
  const startPath: number[] = [offset];
  let current: Node | null = node;

  while (current && current !== container) {
    startPath.unshift(
      Array.from(current.parentNode?.childNodes ?? []).indexOf(current as ChildNode),
    );
    current = current.parentNode;
  }

  if (current === null) {
    return O.none;
  }

  return O.some(startPath);
};

export const toCustomRange = (container: Node) => flow(
  O.fromNullable<Range | null | undefined>,
  O.bindTo('range'),
  O.bind('startPath', ({ range }) => getPath(container, range.startContainer, range.startOffset)),
  O.bind('endPath', ({ range }) => getPath(container, range.endContainer, range.endOffset)),
  O.map(({ startPath, endPath }): CustomRange => ({
    startPath,
    endPath,
    container,
  })),
  O.getOrElseW(() => null),
);

const makePath = (container: Node, path: number[]) => {
  let current = container;

  for (let i = 0; i < path.length - 1; i += 1) {
    current = current?.childNodes?.[path[i]];
  }

  if (!current) {
    return O.none;
  }

  return O.some({ node: current, offset: path[path.length - 1] });
};

export const fromCustomRange = flow(
  O.fromNullable<CustomRange | null | undefined>,
  O.bindTo('customRange'),
  O.bind('start', ({ customRange }) => makePath(customRange.container, customRange.startPath)),
  O.bind('end', ({ customRange }) => makePath(customRange.container, customRange.endPath)),
  O.map(({ start, end }) => fromRangeLike({
    startContainer: start.node,
    startOffset: start.offset,
    endContainer: end.node,
    endOffset: end.offset,
  })),
  O.getOrElseW(() => null),
);
