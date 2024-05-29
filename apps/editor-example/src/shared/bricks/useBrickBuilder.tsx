import {
  ReactElement,
  ReactNode,
  RefObject,
  useMemo,
  useRef,
} from 'react';

import { of } from '@/shared/utils/three';

import { Component } from './brick';
import { bricksToReact } from './bricksToReact';
import { Change } from './changes';
import { bricksToMap } from './utils';

export type BricksBuilderChange = {
  (change: Change): void;
};

export const useBricksBuilder = (
  children: unknown,
  bricks: Component[],
  onChange: (change: Change) => void,
): [ReactNode, RefObject<any>] => {
  const rootValueRef = useRef<any>(null);
  // eslint-disable-next-line max-len
  const cacheRef = useRef<WeakMap<object, { element: ReactElement, node: any; path: { current: string[] } }>>(
    new WeakMap(),
  );

  const element = useMemo(() => {
    rootValueRef.current = of({ children }, ['children']);

    return bricksToReact({
      onChange,
      cache: cacheRef.current,
      slots: bricksToMap(bricks) as Record<string, Component>,
      path: () => ['children'],
      parent: rootValueRef.current,
    })(children);
  }, [bricks, children, onChange]);

  return [element, rootValueRef];
};
