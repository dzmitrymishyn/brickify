import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';

import { type RendererStoreValue } from './models';

export const useRendererStoreFactory = (valueProp: unknown) => {
  const store = useRef(new Map<unknown, RendererStoreValue>());
  const afterRenderAppliers = useRef(
    new Map<unknown, ((stored: RendererStoreValue) => RendererStoreValue)[]>(),
  );

  const get = useCallback(
    <Value = unknown>(key: unknown): RendererStoreValue<Value> | undefined => {
      return store.current.get(key);
    },
    [],
  );

  const set = useCallback(
    (key: unknown, value: RendererStoreValue) => {
      if (!key || typeof key !== 'object') {
        return;
      }
      store.current.set(key, value);
    },
    [],
  );

  const remove = useCallback(
    (key: unknown) => {
      store.current.delete(key);
    },
    [],
  );

  const mutateAfterRender = useCallback((
    key: unknown,
    apply: (stored: RendererStoreValue) => RendererStoreValue,
  ) => {
    afterRenderAppliers.current.set(
      key,
      [...afterRenderAppliers.current.get(key) ?? [], apply],
    );
  }, []);

  useLayoutEffect(() => {
    for (const [key, appliers] of afterRenderAppliers.current) {
      const initialValue = store.current.get(key);

      if (initialValue) {
        const result = appliers.reduce(
          (acc, apply) => apply(acc),
          initialValue,
        );

        store.current.set(key, result);
      }
    }
    afterRenderAppliers.current.clear();
  }, [valueProp]);

  return useMemo(() => ({
    get,
    set,
    delete: remove,
    mutateAfterRender,
  }), [remove, get, set, mutateAfterRender]);
};

export type RendererStore = ReturnType<typeof useRendererStoreFactory>;
