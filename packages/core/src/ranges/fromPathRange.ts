import { fromRangeLike, getNodeByOffset } from '@brickifyio/browser/selection';
import { deepValue } from '@brickifyio/utils/object';
import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';

import { type PathRange, type PathRangeItem } from './pathRange';
import { type BrickStore } from '../store';

const prepareNode = (
  store: BrickStore,
  root: unknown,
  { path, offset }: PathRangeItem,
) => pipe(
  deepValue(root, path),
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
  O.map(fromRangeLike),
  O.getOrElseW(() => null),
);
