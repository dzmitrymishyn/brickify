import { useCallback } from 'react';

// Keep in mind that the length of the array should be always the same
export const useMergedRefs = <T>(...refs: React.Ref<T>[]): React.RefCallback<T> =>
  useCallback(
    (element: T) => {
      refs.forEach((ref) => {
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref && typeof ref === 'object') {
          (ref as React.MutableRefObject<T>).current = element;
        }
      });
    },
    // eslint-disable-next-line -- here could be any array of deps
    refs,
  );
