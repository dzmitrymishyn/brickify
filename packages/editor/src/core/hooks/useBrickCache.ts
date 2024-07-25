import { type Node as TreeNode } from '@brickifyio/utils/slots-tree';
import {
  type ReactElement,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import { type PathRef } from '../utils';

export type CacheItem = {
  value: object;
  pathRef: PathRef;
  react: ReactElement;
  slotsTreeNode: TreeNode;
  domNode?: Node;
};

export const useBrickCache = () => {
  const cacheByElement = useRef(new WeakMap<Node, CacheItem>());
  const cacheByValue = useRef(new WeakMap<object, CacheItem>());

  const get = useCallback(
    (key: object | Element) => {
      if (typeof window !== 'undefined' && key instanceof Node) {
        return cacheByElement.current.get(key);
      }

      return cacheByValue.current.get(key);
    },
    [],
  );

  const set = useCallback(
    (key: object | Element, value: CacheItem) => {
      if (typeof window !== 'undefined' && key instanceof Node) {
        cacheByElement.current.set(key, value);
        return;
      }

      cacheByValue.current.set(key, value);
    },
    [],
  );

  return useMemo(() => ({ get, set }), [get, set]);
};

export type Cache = ReturnType<typeof useBrickCache>;
