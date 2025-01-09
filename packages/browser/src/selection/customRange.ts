import { flow, pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';

import { getCursorPosition, getNodeByOffset, type OffsetCase } from './offset';
import { fromRangeCopy } from './rangeCopy';

type CustomPathSegment = {
  offset: number;
  offsetCase?: OffsetCase;
};

export type CustomRange = {
  startPath: CustomPathSegment;
  endPath: CustomPathSegment;
  container: Node;
};

export const toCustomRange = (container: Node) => flow(
  O.fromNullable<Range | null | undefined>,
  O.bindTo('range'),
  O.map(({ range }) => pipe(
    getCursorPosition(
      container,
      range.startContainer,
      range.startOffset,
    ),
    (start) => ({
      start,
      end: (
        range.startContainer === range.endContainer
        && range.startOffset === range.endOffset
      ) ? start : getCursorPosition(
        container,
        range.endContainer,
        range.endOffset,
      )
    }),
  )),
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
    start: getNodeByOffset(container, startPath.offset, startPath.offsetCase),
    end: getNodeByOffset(container, endPath.offset, endPath.offsetCase),
  })),
  O.map(({ start, end }) => fromRangeCopy({
    startContainer: start.node,
    startOffset: start.offset,
    endContainer: end.node,
    endOffset: end.offset,
  })),
  O.getOrElseW(() => null),
);
