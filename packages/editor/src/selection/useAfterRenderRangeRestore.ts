import { useEffect } from 'react';

export const useAfterRenderRangeRestore = (
  restore: (applier: 'afterMutation') => void,
  value: unknown,
) => {
  useEffect(function restoreRangeAfterValueChange() {
    restore('afterMutation');
  }, [restore, value]);
};
