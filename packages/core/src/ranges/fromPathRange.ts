import { fromRangeCopy, getNodeByOffset } from '@brickifyio/browser/selection';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';

import { type PathRange, type PathRangeItem } from './pathRange';
import { type BrickStore } from '../store';

const findBrickValueByPath = (store: BrickStore, root: unknown, path: string[]) => {
  let current = root;

  for (const slot of path) {
    if (!current || typeof current !== 'object') {
      return null;
    }

    const previous = current;
    current = (current as Record<string, unknown>)[slot];
    const nextStoredItem = store.get(current as object);

    if (!nextStoredItem) {
      const previousStoredItem = store.get(previous);
      if (previousStoredItem) {
        current = previousStoredItem?.slots?.[slot] ?? current;
      }
    }
  }

  return current;
};

const prepareNode = (
  store: BrickStore,
  root: unknown,
  { path, offset }: PathRangeItem,
) => pipe(
  findBrickValueByPath(store, root, path),
  O.fromNullable,
  O.chain((value) => O.fromNullable(store.get(value))),
  O.chain(({ domNode }) => O.fromNullable(domNode)),
  O.map((node) => getNodeByOffset({ node, offset })),
);

export const fromPathRange = (
  pathRange: PathRange,
  root: unknown,
  store: BrickStore,
) => pipe(
  O.Do,
  O.bind('start', () => prepareNode(store, root, pathRange.start)),
  O.bind('end', () => prepareNode(store, root, pathRange.end)),
  O.map(({ start, end }) => ({
    startContainer: start.node,
    startOffset: start.offset,
    endContainer: end.node,
    endOffset: end.offset,
  })),
  O.map(fromRangeCopy),
  O.getOrElseW(() => null),
);
