import {
  type ReactElement,
  type ReactNode,
  type RefObject,
  useMemo,
  useRef,
} from 'react';

import { of } from '@/shared/utils/three';

import { type Component } from './brick';
import { bricksToReact } from './bricksToReact';
import { type Change } from './changes';
import { bricksToMap } from './utils';

export type BricksBuilderChange = (change: Change) => void;

export const useBricksBuilder = (
  children: unknown,
  bricks: Component[],
  onChange: (change: Change) => void,
// eslint-disable-next-line -- check next line
): [ReactNode, RefObject<any>] => {
  // eslint-disable-next-line -- check next line
  const rootValueRef = useRef<any>(null);

  // eslint-disable-next-line -- check next line
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
      // eslint-disable-next-line -- check next line
      parent: rootValueRef.current,
    })(children);
  }, [bricks, children, onChange]);

  return [element, rootValueRef];
};
