import { useMemo } from 'react';

import { type RendererStoreValue } from './models';

export type RendererStoreKey = object | Node;

const createStore = () => {
  const store = new Map<RendererStoreKey, RendererStoreValue>();

  return {
    get: <Value = unknown>(
      key: RendererStoreKey,
    ): RendererStoreValue<Value> | undefined => store.get(key),
    set: store.set.bind(store),
    update: (key: RendererStoreKey, value: object) => {
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

