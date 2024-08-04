import {
  useCallback,
  useMemo,
  useRef,
} from 'react';

import { type BrickStore, type BrickStoreValue } from '../store';

export const useBrickStoreFactory = (): BrickStore => {
  const storeByElement = useRef(new Map<Node, BrickStoreValue>());
  const storeByValue = useRef(new Map<object, BrickStoreValue>());

  const getStoreByKey = useCallback((key: object | Node) => {
    if (typeof window !== 'undefined' && key instanceof Node) {
      return storeByElement.current;
    }

    return storeByValue.current;
  }, []);

  const get = useCallback(
    (key: object | Node) => getStoreByKey(key).get(key),
    [getStoreByKey],
  );

  const set = useCallback(
    (key: object | Node, value: BrickStoreValue) => {
      const store = getStoreByKey(key);
      store.set(key, value);
    },
    [getStoreByKey],
  );

  const update = useCallback(
    (key: object | Node, value: Partial<BrickStoreValue>) => {
      const store = getStoreByKey(key);
      const storedValue = store.get(key);

      if (storedValue) {
        const oldDomNode = storedValue.domNode;

        Object.assign(storedValue, value);

        if (oldDomNode && oldDomNode !== storedValue.domNode) {
          storeByElement.current.delete(oldDomNode);
        }

        if (storedValue.domNode) {
          storeByElement.current.set(storedValue.domNode, storedValue);
        }

        storeByValue.current.set(storedValue.value, storedValue);
      }

      return Boolean(storedValue);
    },
    [getStoreByKey],
  );

  const remove = useCallback(
    (key: object | Node) => getStoreByKey(key).delete(key),
    [getStoreByKey],
  );

  return useMemo(() => ({
    update,
    get,
    set,
    remove,
  }), [get, set, remove, update]);
};

