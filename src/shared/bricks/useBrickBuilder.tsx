import {
  ReactElement,
  ReactNode,
  useMemo,
  useRef,
} from 'react';

import { Brick } from './brick';
import { bricksToReact } from './bricksToReact';
import { bricksToMap } from './utils';

export const useBricksBuilder = (
  value: unknown,
  bricks: Brick[],
): ReactNode => {
  const cacheRef = useRef<WeakMap<object, ReactElement>>(new WeakMap());

  const element = useMemo(() => bricksToReact(
    cacheRef.current,
    ['children', bricksToMap(bricks) as Record<string, Brick>],
  )(value), [bricks, value]);

  return element;
};
