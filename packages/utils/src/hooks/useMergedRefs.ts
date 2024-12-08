import { type Ref, useCallback } from 'react';

// Keep in mind that the length of the array should be always the same
export const useMergedRefs = <T>(...refs: Ref<T>[]): React.RefCallback<T> =>
  useCallback(
    (element: T) => {
      refs.forEach((ref) => {
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref && typeof ref === 'object') {
          ref.current = element;
        }
      });
    },
    refs,
  );
