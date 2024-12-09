import { flow } from 'fp-ts/lib/function';
import * as O from 'fp-ts/lib/Option';

import { createRange, getRange } from './range';

export type RangeCopy = Pick<
  Range,
  'startContainer' | 'endContainer' | 'startOffset' | 'endOffset'
>;

export const getRangeCopy = flow(
  getRange,
  O.fromNullable,
  O.map(({ startContainer, startOffset, endContainer, endOffset }) => ({
    startContainer,
    startOffset,
    endContainer,
    endOffset,
  } as RangeCopy)),
  O.toUndefined,
);

export const fromRangeCopy = flow(
  O.fromNullable<RangeCopy | null | undefined>,
  O.chain(O.fromPredicate((a) => Boolean(a.startContainer ?? a.endContainer))),
  O.map((rangeCopy: RangeCopy) => createRange(
    rangeCopy.startContainer,
    rangeCopy.endContainer,
    rangeCopy.startOffset,
    rangeCopy.endOffset,
  )),
  O.toNullable,
);

export const toRangeCopy = flow(
  O.fromNullable<Range | null | undefined>,
  O.map(({ startContainer, startOffset, endContainer, endOffset }) => ({
    startContainer,
    startOffset,
    endContainer,
    endOffset,
  })),
  O.toNullable,
);
