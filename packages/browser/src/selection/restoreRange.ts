import { pipe } from 'fp-ts/lib/function';

import { fromCustomRange } from './customRange';
import { type AnyRange } from './models';
import { addRange } from './range';
import { fromRangeCopy } from './rangeCopy';

export const restoreRange = (
  range?: null | AnyRange,
) => {
  if (!range || typeof range !== 'object') {
    return false;
  }

  if ('startContainer' in range && 'endContainer' in range) {
    return pipe(range, fromRangeCopy, addRange);
  }

  if ('container' in range) {
    return pipe(range, fromCustomRange, addRange);
  }

  throw new Error('Unknown range type', range);
};
