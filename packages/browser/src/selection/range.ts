import { flow } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';

import { getSelection } from './selection';
import { isText } from '../utils';

export type CustomRange = Pick<
  Range,
  'startContainer' | 'endContainer' | 'startOffset' | 'endOffset'
>;

export const createRange = (
  startContainer: Node,
  endContainer: Node,
  startOffset?: number,
  endOffset?: number,
) => {
  const range = new Range();

  range.setStart(startContainer, startOffset ?? 0);
  range.setEnd(
    endContainer,
    (
      endOffset
      ?? (isText(endContainer) ? endContainer.textContent?.length : endContainer.childNodes.length)
      ?? 0
    ),
  );

  return range;
};

export const getRange = flow(
  getSelection,
  O.map((selection) => selection.getRangeAt(0)),
  O.toNullable,
);

export const getCustomRange = flow(
  getRange,
  O.fromNullable,
  O.map(({ startContainer, startOffset, endContainer, endOffset }): CustomRange => ({
    startContainer,
    startOffset,
    endContainer,
    endOffset,
  })),
  O.toNullable,
)

export const addRange = flow(
  O.fromNullable<Range | null>,
  O.bindTo('newRange'),
  O.bind('selection', getSelection),
  O.map(({ selection, newRange }) => {
    selection.removeAllRanges();
    selection.addRange(newRange);
    return true;
  }),
  O.getOrElse(() => false),
);

export const fromCustomRange = flow(
  O.fromNullable<CustomRange | null | undefined>,
  O.map((customRange: CustomRange) => {
    const range = new Range();
    range.setStart(customRange.startContainer, customRange.startOffset);
    range.setEnd(customRange.endContainer, customRange.endOffset);
    return range;
  }),
  O.toNullable,
);

export const toCustomRange = flow(
  O.fromNullable<CustomRange | null | undefined>,
  O.map((customRange: CustomRange) => {
    const range = new Range();
    range.setStart(customRange.startContainer, customRange.startOffset);
    range.setEnd(customRange.endContainer, customRange.endOffset);
    return range;
  }),
  O.toNullable,
);
