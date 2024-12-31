import { useMemo } from 'react';

import { type RendererStoreValue } from './models';

const createStore = () => {
  const store = new Map<unknown, RendererStoreValue>();

  return {
    get: <Value = unknown>(
      key: unknown,
    ): RendererStoreValue<Value> | undefined => store.get(key),
    set: store.set.bind(store),
    update: (key: unknown, value: object) => {
      const stored = store.get(key);

      if (stored) {
        Object.assign(stored, value);
      }
    },
    delete: store.delete.bind(store),
  };
};

export type RendererStore = ReturnType<typeof createStore>;

export const useRendererStoreFactory = () => useMemo(createStore, []);

