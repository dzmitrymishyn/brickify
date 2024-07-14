import { of, type Node as SlotsTreeNode } from '@brickifyio/utils/slots-tree';
import {
  type ReactNode,
  type RefObject,
  useMemo,
  useRef,
} from 'react';

import { type Component } from './brick';
import { type CacheItem, objectToReact } from './objectToReact';
import { bricksToMap } from './utils';
import { type ChangeEvent, useBrickContext } from '../core';

export const useBricksBuilder = (
  children: unknown,
  bricks: Component[],
  onChange: (...changes: ChangeEvent[]) => void,
): [ReactNode, RefObject<SlotsTreeNode | undefined>] => {
  const { pathRef } = useBrickContext();
  const rootValueRef = useRef<SlotsTreeNode | undefined>(undefined);

  const cacheRef = useRef<WeakMap<object, CacheItem>>(
    new WeakMap(),
  );

  const element = useMemo(() => {
    const oldParent = rootValueRef.current;
    rootValueRef.current = of({ children }, pathRef.current());

    return objectToReact(children)({
      onChange,
      cache: cacheRef.current,
      slots: bricksToMap(bricks) as Record<string, Component>,
      parentPathRef: pathRef,
      parent: rootValueRef.current,
      oldParent,
    });
  }, [bricks, children, onChange, pathRef]);

  return [element, rootValueRef];
};
