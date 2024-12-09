import { useEffect } from 'react';

import { RangeType } from './utils';

export const useAfterMutationRangeRestore = (
  restoreRange: (type: RangeType) => void,
  value: unknown,
) => {
  useEffect(function restoreRangeAfterValueChange() {
    restoreRange(RangeType.AfterValueChange);
  }, [restoreRange, value]);
};
