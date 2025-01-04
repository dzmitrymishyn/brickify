import { flow } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';

import { getCursorPosition, getNodeByOffset } from './offset';
import { fromRangeCopy } from './rangeCopy';

type CustomPathSegment = {
  offset: number;
  childOffset: number;
  childOffsetType: 'start' | 'end' | 'center';
};

export type CustomRange = {
  startPath: CustomPathSegment;
  endPath: CustomPathSegment;
  container: Node;
};

export const toCustomRange = (container: Node) => flow(
  O.fromNullable<Range | null | undefined>,
  O.bindTo('range'),
  O.map(({ range }) => ({
    start: getCursorPosition(
      container,
      range.startContainer,
      range.startOffset,
    ),
    end: getCursorPosition(container, range.endContainer, range.endOffset),
  })),
  O.map(({ start, end }): CustomRange => ({
    startPath: start,
    endPath: end,
    container,
  })),
  O.toUndefined,
);

export const fromCustomRange = flow(
  O.fromNullable<CustomRange | null | undefined>,
  O.map(({ startPath, endPath, container }) => ({
    start: getNodeByOffset({ ...startPath, node: container }),
    end: getNodeByOffset({ ...endPath, node: container }),
  })),
  O.map(({ start, end }) => fromRangeCopy({
    startContainer: start.node,
    startOffset: start.offset,
    endContainer: end.node,
    endOffset: end.offset,
  })),
  O.getOrElseW(() => null),
);
