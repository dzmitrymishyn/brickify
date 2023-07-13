import { useCallback, useMemo, useRef } from 'react';

type Key = string | object;

export const useCache = <T>() => {
  const cache = useRef(new Map<string, T>());
  const weakCache = useRef(new WeakMap<object, T>());

  const add = useCallback((key: Key, item: T) => {
    if (typeof key === 'string') {
      cache.current.set(key, item);
    } else {
      weakCache.current.set(key, item);
    }
  }, []);

  const get = useCallback((key: Key) => (
    typeof key === 'string'
      ? cache.current.get(key)
      : weakCache.current.get(key)
  ), []);

  return useMemo(() => ({
    add,
    get,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
};

export type Cache<T> = ReturnType<typeof useCache<T>>;
