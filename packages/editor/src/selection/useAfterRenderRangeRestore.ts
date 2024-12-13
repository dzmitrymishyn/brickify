import { useEffect } from 'react';

export const useAfterRenderRangeRestore = (
  restore: (applier: 'applyOnRender') => void,
  value: unknown,
) => {
  useEffect(function restoreRangeAfterValueChange() {
    restore('applyOnRender');
  }, [restore, value]);
};
