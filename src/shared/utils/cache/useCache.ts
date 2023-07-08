import { useCallback, useMemo, useRef } from 'react';

export const useCache = <T, Key = string>() => {
  const cache = useRef(new Map<Key, T>());

  const add = useCallback((key: Key, item: T) => {
    cache.current.set(key, item);
  }, []);

  const get = useCallback((key: Key) => cache.current.get(key) || null, []);

  const forEach = useCallback((fn: (value: T) => void) =>
    Object.values(cache.current).forEach(fn), []);

  const find = useCallback((fn: (value: T) => boolean) =>
    Object.values(cache.current).find(fn), []);

  const filter = useCallback((fn: (value: T) => boolean) =>
    Object.values(cache.current).filter(fn), []);

  const update = useCallback((key: Key, item: Partial<T>) => {
    const oldValue = cache.current.get(key);
    if (oldValue) {
      cache.current.set(key, {
        ...oldValue,
        ...item,
      });
    }
  }, []);

  const remove = useCallback((key: Key) => {
    cache.current.delete(key);
  }, []);

  return useMemo(() => ({
    add,
    remove,
    get,
    find,
    filter,
    update,
    forEach,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
};

export type Cache<T, K = string> = ReturnType<typeof useCache<T, K>>;
