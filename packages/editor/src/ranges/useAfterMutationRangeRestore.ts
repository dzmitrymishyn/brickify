import {
  addRange,
  fromCustomRange,
  fromRangeCopy,
} from '@brickifyio/browser/selection';
import { pipe } from 'fp-ts/lib/function';
import { useEffect } from 'react';

import { AFTER_CHANGE, type RangesController } from './utils';

export const useAfterMutationRangeRestore = (
  rangesMap: RangesController,
  value: unknown,
) => {
  useEffect(function restoreRangeAfterValueChange() {
    const range = rangesMap.get(AFTER_CHANGE);

    if (!range) {
      return;
    }

    if ('startContainer' in range && 'endContainer' in range) {
      pipe(range, fromRangeCopy, addRange);
    } else if ('container' in range) {
      pipe(range, fromCustomRange, addRange);
    }
  }, [rangesMap, value]);
};
