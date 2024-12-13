import { flow, pipe } from 'fp-ts/lib/function';

import { fromCustomRange } from './customRange';
import { type AnyRange } from './models';
import { addRange } from './range';
import { fromRangeCopy } from './rangeCopy';

export const anyRangeToRange = (
  range?: null | AnyRange,
) => {
  if (!range || typeof range !== 'object') {
    return null;
  }

  if ('startContainer' in range && 'endContainer' in range) {
    return pipe(range, fromRangeCopy);
  }

  if ('container' in range) {
    return pipe(range, fromCustomRange);
  }

  throw new Error('Unknown range type', range);
};

export const restoreRange = flow(
  anyRangeToRange,
  addRange,
);
