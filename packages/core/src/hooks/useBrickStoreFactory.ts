import { type Node as TreeNode } from '@brickifyio/utils/slots-tree';
import {
  type ReactElement,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import { type PathRef } from '../utils';

export type BrickStoreItem = {
  value: object;
  pathRef: PathRef;
  react?: ReactElement;
  slotsTreeNode: TreeNode;
  slotsTreeParent?: TreeNode;
  domNode?: Node;
};

export const useBrickStoreFactory = () => {
  const storeByElement = useRef(new Map<Node, BrickStoreItem>());
  const storeByValue = useRef(new Map<object, BrickStoreItem>());

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
    (key: object | Node, value: BrickStoreItem) => {
      const store = getStoreByKey(key);
      store.set(key, value);
    },
    [getStoreByKey],
  );

  const remove = useCallback(
    (key: object | Node) => getStoreByKey(key).delete(key),
    [getStoreByKey],
  );

  return useMemo(() => ({ get, set, remove }), [get, set, remove]);
};

export type BrickStore = ReturnType<typeof useBrickStoreFactory>;
