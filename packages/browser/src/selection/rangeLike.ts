import { flow } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';

import { getRange } from './range';

export type RangeLike = Pick<
  Range,
  'startContainer' | 'endContainer' | 'startOffset' | 'endOffset'
>;

export const getRangeLike = flow(
  getRange,
  O.fromNullable,
  O.map(({ startContainer, startOffset, endContainer, endOffset }) => ({
    startContainer,
    startOffset,
    endContainer,
    endOffset,
  } as RangeLike)),
  O.toUndefined,
);

export const fromRangeLike = flow(
  O.fromNullable<RangeLike | null | undefined>,
  O.chain(O.fromPredicate((a) => Boolean(a.startContainer ?? a.endContainer))),
  O.map((rangeLike: RangeLike) => {
    const range = new Range();
    range.setStart(rangeLike.startContainer, rangeLike.startOffset);
    range.setEnd(rangeLike.endContainer, rangeLike.endOffset);
    return range;
  }),
  O.toNullable,
);

export const toRangeLike = flow(
  O.fromNullable<Range | null | undefined>,
  O.map(({ startContainer, startOffset, endContainer, endOffset}) => ({
    startContainer,
    startOffset,
    endContainer,
    endOffset,
  })),
  O.toNullable,
);
