import { useCallback } from 'react';

export default function useMergedRefs<T>(...refs: React.Ref<T>[]): React.RefCallback<T> {
  return useCallback(
    (element: T) => {
      for (let i = 0; i < refs.length; i += 1) {
        const ref = refs[i];
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref && typeof ref === 'object') {
          (ref as React.MutableRefObject<T>).current = element;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs,
  );
}
