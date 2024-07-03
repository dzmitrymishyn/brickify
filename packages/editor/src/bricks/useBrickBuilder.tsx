import { of, type Node as SlotsTreeNode } from '@brickifyio/utils/slots-tree';
import {
  type ReactNode,
  type RefObject,
  useMemo,
  useRef,
} from 'react';

import { type Component } from './brick';
import { type Change } from './changes';
import { type CacheItem, objectToReact } from './objectToReact';
import { bricksToMap } from './utils';

export type BricksBuilderChange = (change: Change) => void;

export const useBricksBuilder = (
  children: unknown,
  bricks: Component[],
  onChange: (change: Change) => void,
): [ReactNode, RefObject<SlotsTreeNode>] => {
  const rootValueRef = useRef<SlotsTreeNode | null>(null);

  const cacheRef = useRef<WeakMap<object, CacheItem>>(
    new WeakMap(),
  );

  const element = useMemo(() => {
    rootValueRef.current = of({ children }, ['children']);

    return objectToReact(children)({
      onChange,
      cache: cacheRef.current,
      slots: bricksToMap(bricks) as Record<string, Component>,
      parentPathRef: { current: () => ['children'] },
      parent: rootValueRef.current,
    });
  }, [bricks, children, onChange]);

  return [element, rootValueRef];
};
