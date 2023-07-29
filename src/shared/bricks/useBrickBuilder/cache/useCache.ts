import { ReactElement, useCallback, useMemo, useRef } from 'react';

export const useCache = () => {
  const weakCache = useRef(new WeakMap<object, ReactElement>());

  const add = useCallback((key: object, item: ReactElement) => {
    weakCache.current.set(key, item);
  }, []);

  const get = useCallback((key: object) => (
    weakCache.current.get(key)
  ), []);

  return useMemo(() => ({
    add,
    get,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
};

export type Cache = ReturnType<typeof useCache>;
