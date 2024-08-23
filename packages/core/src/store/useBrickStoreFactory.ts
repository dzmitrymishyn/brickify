import { useMemo } from 'react';

import { type BrickStoreValue } from './models';

export type BrickStoreKey = object | Node;

const createStore = () => {
  const store = new Map<BrickStoreKey, BrickStoreValue>();
  console.log('store', store);

  return {
    get: <Value = unknown>(
      key: BrickStoreKey,
    ): BrickStoreValue<Value> | undefined => store.get(key),
    set: <Value = unknown>(
      key: BrickStoreKey, value: BrickStoreValue<Value>,
    ) => {
      store.set(key, value);
    },
    update: (key: BrickStoreKey, value: object) => {
      const stored = store.get(key);

      if (stored) {
        Object.assign(stored, value);
      }
    },
    delete: store.delete.bind(store),
  };
};

export type BrickStore = ReturnType<typeof createStore>;

export const useBrickStoreFactory = () => useMemo(createStore, []);

