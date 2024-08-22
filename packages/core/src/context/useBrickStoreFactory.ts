import { useMemo, useRef, useState } from 'react';

import { type BrickStore, type BrickStoreValue } from '../store';
import { debug } from '@brickifyio/operators';

const createStore = (): BrickStore => {
  const store = new Map<Node | object, BrickStoreValue>();
  console.log('store', store);

  const update = (key: object | Node, value: Partial<BrickStoreValue>) => {
    const storedValue = store.get(key);

    if (storedValue) {
      const oldDomNode = storedValue.domNode;

      Object.assign(storedValue, value);

      if (oldDomNode && oldDomNode !== storedValue.domNode) {
        store.delete(oldDomNode);
      }

      if (storedValue.domNode) {
        store.set(storedValue.domNode, storedValue);
      }

      store.set(storedValue.value, storedValue);
    }

    return Boolean(storedValue);
  };

  return {
    get: store.get.bind(store),
    set: store.set.bind(store),
    delete: store.delete.bind(store),
    update,
  };
};

export const useBrickStoreFactory = () => useMemo(createStore, []);

