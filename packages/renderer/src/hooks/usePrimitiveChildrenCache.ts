import { useCallback, useMemo, useRef } from 'react';

export const usePrimitiveChildrenCache = () => {
  const cacheRef = useRef<Record<string, { value: unknown }>>({});

  const get = useCallback(
    (index: string, previousValue: unknown): { value: unknown } | undefined => {
      return cacheRef.current[index]?.value === previousValue
        ? cacheRef.current[index]
        : undefined;
    },
    [],
  );

  const save = useCallback((index: string, value: unknown): { value: unknown } => {
    if (cacheRef.current[index]?.value !== value) {
      cacheRef.current[index] = { value };
    }
    return cacheRef.current[index];
  }, []);

  return useMemo(() => ({ get, save }), [get, save]);
};
