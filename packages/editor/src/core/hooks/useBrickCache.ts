import { type Node as TreeNode } from '@brickifyio/utils/slots-tree';
import {
  type MutableRefObject,
  type ReactElement,
  useCallback,
  useMemo,
  useRef,
} from 'react';

export type PathRef = MutableRefObject<() => string[]>;

export type CacheItem = {
  element: ReactElement;
  node: TreeNode;
  pathRef: PathRef;
};

export const useBrickCache = () => {
  const cacheByElement = useRef(new WeakMap<Node, CacheItem>());
  const cacheByValue = useRef(new WeakMap<object, CacheItem>());

  const get = useCallback(
    (key: object | Node) => {
      if (typeof window !== 'undefined' && key instanceof Node) {
        return cacheByElement.current.get(key);
      }

      return cacheByValue.current.get(key);
    },
    [],
  );

  const set = useCallback(
    (key: Node | object, value: CacheItem) => {
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
