import { useCallback, useMemo, useRef } from 'react';

import { BrickCacheValue } from './models';

type Key = string | object;

export const useCache = () => {
  const cache = useRef<Record<string, BrickCacheValue>>({});
  const weakCache = useRef(new WeakMap<object, BrickCacheValue>());

  const add = useCallback((key: Key, item: BrickCacheValue) => {
    if (typeof key === 'string') {
      cache.current[key] = item;
    } else {
      weakCache.current.set(key, item);
    }
  }, []);

  const get = useCallback((key: Key) => (
    typeof key === 'string'
      ? cache.current[key]
      : weakCache.current.get(key)
  ), []);

  return useMemo(() => ({
    add,
    get,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
};

export type Cache = ReturnType<typeof useCache>;
