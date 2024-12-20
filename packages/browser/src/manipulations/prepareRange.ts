import { flow, pipe } from 'fp-ts/lib/function';
import * as I from 'fp-ts/lib/Identity';
import * as O from 'fp-ts/lib/Option';

import { createRange, isRangeWithinContainer, type RangeCopy } from '../selection';
import { getFirstDeepLeaf, getLastDeepLeaf, isText, splitBoundaryText } from '../utils';

export const makeRangeWithinContainer = (range: Range) => flow(
  I.of<HTMLElement>,
  I.bindTo('container'),
  I.bind('rangeWithinContainer', ({ container }) => (
    isRangeWithinContainer(range, container)
  )),
  I.bind('start', ({ rangeWithinContainer, container }) => (
    rangeWithinContainer.start
      ? [range.startContainer, range.startOffset] as const
      : [
        getFirstDeepLeaf(container)!,
        0,
      ] as const
  )),
  I.bind('end', ({ rangeWithinContainer, container }) => {
    const lastDeepLeaf = getLastDeepLeaf(container) ?? container;
    return rangeWithinContainer.end
      ? [range.endContainer, range.endOffset] as const
      : [
        lastDeepLeaf,
        isText(lastDeepLeaf)
          ? lastDeepLeaf.textContent?.length ?? 0
          : lastDeepLeaf?.childNodes.length ?? 0
      ] as const;
  }),
  I.map(({
    start: [startContainer, startOffset],
    end: [endContainer, endOffset],
  }) => createRange(startContainer, endContainer, startOffset, endOffset)),
)

export const prepareRange = (
  range: Range,
  container?: HTMLElement | null,
) => pipe(
  O.fromNullable(container),
  O.map(makeRangeWithinContainer(range)),
  O.map(splitBoundaryText),
  O.getOrElseW(() => range),
);

export const restoreRange = (
  initialRange: RangeCopy | null,
  containerRange: RangeCopy,
  rangeWithinContainer: ReturnType<typeof isRangeWithinContainer>,
) => {
  const startContainer = initialRange && !rangeWithinContainer.start
    ? initialRange.startContainer
    : containerRange.startContainer;
  const startOffset = initialRange && !rangeWithinContainer.start
    ? initialRange.startOffset
    : undefined;

  const endContainer = initialRange && !rangeWithinContainer.end
    ? initialRange.endContainer
    : containerRange.endContainer;
  const endOffset = initialRange && !rangeWithinContainer.end
    ? initialRange.endOffset
    : undefined;

  return createRange(startContainer, endContainer, startOffset, endOffset);
};
