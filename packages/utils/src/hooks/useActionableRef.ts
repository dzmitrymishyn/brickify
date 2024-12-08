import { useMemo, useRef } from 'react';

import { useSyncedRef } from './useSyncedRef';

export const useActionableRef = <T>(onSet: (value: T | null) => void) => {
  const realRef = useRef<T>(null);
  const onSetRef = useSyncedRef(onSet);

  return useMemo(() => new Proxy(realRef, {
    set(target, prop, value) {
      if (prop === 'current' && target.current !== value) {
        onSetRef.current(value as T | null);
        target.current = value as T | null;
        return true;
      }
      return Reflect.set(target, prop, value);
    },
    get: (target, prop) => Reflect.get(target, prop) as T | null,
  }), []);
};
